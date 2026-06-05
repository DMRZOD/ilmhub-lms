import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { paginate } from '../../common/dto/pagination.dto';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { ListPublicBlogDto } from './dto/list-public-blog.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

const POST_LIST_SELECT = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  coverImageUrl: true,
  tags: true,
  publishedAt: true,
  author: { select: { id: true, name: true, avatarUrl: true } },
  category: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.BlogPostSelect;

const COMMENT_USER_SELECT = {
  id: true,
  name: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;

const COMMENT_INCLUDE = {
  user: { select: COMMENT_USER_SELECT },
  replies: {
    orderBy: { createdAt: 'asc' },
    include: { user: { select: COMMENT_USER_SELECT } },
  },
} satisfies Prisma.CommentInclude;

type PostPayload = Prisma.BlogPostGetPayload<{ select: typeof POST_LIST_SELECT }>;
type CommentPayload = Prisma.CommentGetPayload<{ include: typeof COMMENT_INCLUDE }>;

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublished(query: ListPublicBlogDto) {
    const { page, limit, q, categorySlug } = query;
    const where: Prisma.BlogPostWhereInput = {
      status: 'PUBLISHED',
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { excerpt: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(categorySlug ? { category: { is: { slug: categorySlug } } } : {}),
    };

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.blogPost.count({ where }),
      this.prisma.blogPost.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: POST_LIST_SELECT,
      }),
    ]);

    return paginate(rows.map((r) => this.shapePost(r)), total, page, limit);
  }

  listCategories() {
    return this.prisma.blogCategory.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async getBySlug(slug: string) {
    const post = await this.prisma.blogPost.findFirst({
      where: { slug, status: 'PUBLISHED' },
      select: { ...POST_LIST_SELECT, content: true },
    });
    if (!post) throw new NotFoundException('blog_post_not_found');
    const { content, ...rest } = post;
    return { ...this.shapePost(rest), content };
  }

  async listComments(slug: string) {
    const post = await this.requirePublishedPost(slug);
    const rows = await this.prisma.comment.findMany({
      where: { blogPostId: post.id, parentId: null },
      orderBy: { createdAt: 'desc' },
      include: COMMENT_INCLUDE,
    });
    return rows.map((c) => this.shapeComment(c));
  }

  async createComment(userId: string, slug: string, dto: CreateCommentDto) {
    const post = await this.requirePublishedPost(slug);
    const body = dto.body.trim();
    if (!body) throw new BadRequestException('empty_comment');

    if (dto.parentId) {
      const parent = await this.prisma.comment.findUnique({
        where: { id: dto.parentId },
        select: { id: true, blogPostId: true, parentId: true },
      });
      if (!parent || parent.blogPostId !== post.id) {
        throw new NotFoundException('parent_comment_not_found');
      }
      // Keep the thread one level deep — replies attach to top-level comments only.
      if (parent.parentId) throw new BadRequestException('cannot_reply_to_reply');
    }

    const created = await this.prisma.comment.create({
      data: {
        blogPostId: post.id,
        userId,
        body,
        parentId: dto.parentId ?? null,
      },
      include: COMMENT_INCLUDE,
    });
    return this.shapeComment(created);
  }

  async deleteComment(user: AuthenticatedUser, commentId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, userId: true },
    });
    if (!comment) throw new NotFoundException('comment_not_found');
    if (comment.userId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException('not_your_comment');
    }
    // Replies cascade via the self-relation onDelete: Cascade.
    await this.prisma.comment.delete({ where: { id: commentId } });
    return { id: commentId, deleted: true };
  }

  // ---------- helpers ----------

  private async requirePublishedPost(slug: string) {
    const post = await this.prisma.blogPost.findFirst({
      where: { slug, status: 'PUBLISHED' },
      select: { id: true },
    });
    if (!post) throw new NotFoundException('blog_post_not_found');
    return post;
  }

  private shapePost(p: PostPayload) {
    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      coverImageUrl: p.coverImageUrl,
      tags: p.tags,
      publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
      author: p.author,
      category: p.category,
    };
  }

  private shapeComment(c: CommentPayload) {
    return {
      id: c.id,
      body: c.body,
      createdAt: c.createdAt.toISOString(),
      user: c.user,
      replies: c.replies.map((r) => ({
        id: r.id,
        body: r.body,
        createdAt: r.createdAt.toISOString(),
        user: r.user,
      })),
    };
  }
}
