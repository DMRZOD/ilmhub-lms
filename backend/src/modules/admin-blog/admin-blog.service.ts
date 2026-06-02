import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { paginate } from '../../common/dto/pagination.dto';
import { slugify } from '../../common/utils/slugify';
import { ListBlogDto } from './dto/list-blog.dto';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto/blog-post.dto';
import {
  CreateBlogCategoryDto,
  UpdateBlogCategoryDto,
} from './dto/blog-category.dto';

const POST_LIST_SELECT = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  coverImageUrl: true,
  tags: true,
  status: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  author: { select: { id: true, name: true, avatarUrl: true } },
  category: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.BlogPostSelect;

@Injectable()
export class AdminBlogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ---------- Blog categories ----------

  listCategories() {
    return this.prisma.blogCategory.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async createCategory(adminId: string, dto: CreateBlogCategoryDto) {
    const slug = await this.uniqueCategorySlug(dto.slug || dto.name, null);
    const category = await this.prisma.blogCategory.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description ?? null,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
    await this.audit.log(
      adminId,
      'CMS_CATEGORY_CREATED',
      'BLOG_CATEGORY',
      category.id,
      { name: category.name, scope: 'blog' },
    );
    return category;
  }

  async updateCategory(adminId: string, id: string, dto: UpdateBlogCategoryDto) {
    await this.getCategoryOrThrow(id);
    const data: Prisma.BlogCategoryUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    if (dto.slug !== undefined) {
      data.slug = await this.uniqueCategorySlug(dto.slug, id);
    }
    const category = await this.prisma.blogCategory.update({
      where: { id },
      data,
    });
    await this.audit.log(
      adminId,
      'CMS_CATEGORY_UPDATED',
      'BLOG_CATEGORY',
      id,
      { scope: 'blog' },
    );
    return category;
  }

  async deleteCategory(adminId: string, id: string) {
    await this.getCategoryOrThrow(id);
    // Posts keep their content; categoryId is set null (schema onDelete: SetNull).
    await this.prisma.blogCategory.delete({ where: { id } });
    await this.audit.log(
      adminId,
      'CMS_CATEGORY_DELETED',
      'BLOG_CATEGORY',
      id,
      { scope: 'blog' },
    );
    return { id, deleted: true };
  }

  // ---------- Blog posts ----------

  async list(query: ListBlogDto) {
    const { page, limit, q, status, categoryId } = query;
    const where: Prisma.BlogPostWhereInput = {
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { excerpt: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(status ? { status } : {}),
      ...(categoryId ? { categoryId } : {}),
    };

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.blogPost.count({ where }),
      this.prisma.blogPost.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: POST_LIST_SELECT,
      }),
    ]);

    return paginate(rows.map((r) => this.shapePost(r)), total, page, limit);
  }

  async detail(id: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { id },
      select: { ...POST_LIST_SELECT, content: true, categoryId: true },
    });
    if (!post) throw new NotFoundException('blog_post_not_found');
    return { ...this.shapePost(post), content: post.content };
  }

  async create(adminId: string, dto: CreateBlogPostDto) {
    const slug = await this.uniquePostSlug(dto.slug || dto.title, null);
    const publish = dto.status === 'PUBLISHED';
    const post = await this.prisma.blogPost.create({
      data: {
        authorId: adminId,
        title: dto.title,
        slug,
        excerpt: dto.excerpt ?? null,
        content: dto.content ?? '',
        coverImageUrl: dto.coverImageUrl ?? null,
        categoryId: dto.categoryId ?? null,
        tags: dto.tags ?? [],
        status: dto.status ?? 'DRAFT',
        publishedAt: publish ? new Date() : null,
      },
      select: { ...POST_LIST_SELECT, content: true, categoryId: true },
    });
    await this.audit.log(adminId, 'BLOG_CREATED', 'BLOG_POST', post.id, {
      title: post.title,
    });
    if (publish) {
      await this.audit.log(adminId, 'BLOG_PUBLISHED', 'BLOG_POST', post.id, {
        title: post.title,
      });
    }
    return { ...this.shapePost(post), content: post.content };
  }

  async update(adminId: string, id: string, dto: UpdateBlogPostDto) {
    const existing = await this.prisma.blogPost.findUnique({
      where: { id },
      select: { id: true, title: true, status: true, publishedAt: true },
    });
    if (!existing) throw new NotFoundException('blog_post_not_found');

    const data: Prisma.BlogPostUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.excerpt !== undefined) data.excerpt = dto.excerpt;
    if (dto.content !== undefined) data.content = dto.content;
    if (dto.coverImageUrl !== undefined) data.coverImageUrl = dto.coverImageUrl;
    if (dto.tags !== undefined) data.tags = dto.tags;
    if (dto.slug !== undefined) {
      data.slug = await this.uniquePostSlug(dto.slug, id);
    }
    if (dto.categoryId !== undefined) {
      data.category = dto.categoryId
        ? { connect: { id: dto.categoryId } }
        : { disconnect: true };
    }

    // Status transitions also flip publishedAt and emit a dedicated audit entry.
    let transition: 'PUBLISHED' | 'UNPUBLISHED' | null = null;
    if (dto.status !== undefined && dto.status !== existing.status) {
      data.status = dto.status;
      if (dto.status === 'PUBLISHED') {
        transition = 'PUBLISHED';
        if (!existing.publishedAt) data.publishedAt = new Date();
      } else {
        transition = 'UNPUBLISHED';
      }
    }

    const post = await this.prisma.blogPost.update({
      where: { id },
      data,
      select: { ...POST_LIST_SELECT, content: true, categoryId: true },
    });

    await this.audit.log(adminId, 'BLOG_UPDATED', 'BLOG_POST', id, {
      title: post.title,
    });
    if (transition === 'PUBLISHED') {
      await this.audit.log(adminId, 'BLOG_PUBLISHED', 'BLOG_POST', id, {
        title: post.title,
      });
    } else if (transition === 'UNPUBLISHED') {
      await this.audit.log(adminId, 'BLOG_UNPUBLISHED', 'BLOG_POST', id, {
        title: post.title,
      });
    }

    return { ...this.shapePost(post), content: post.content };
  }

  async remove(adminId: string, id: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { id },
      select: { id: true, title: true },
    });
    if (!post) throw new NotFoundException('blog_post_not_found');
    await this.prisma.blogPost.delete({ where: { id } });
    await this.audit.log(adminId, 'BLOG_DELETED', 'BLOG_POST', id, {
      title: post.title,
    });
    return { id, deleted: true };
  }

  // ---------- helpers ----------

  private shapePost(
    p: Prisma.BlogPostGetPayload<{ select: typeof POST_LIST_SELECT }>,
  ) {
    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      coverImageUrl: p.coverImageUrl,
      tags: p.tags,
      status: p.status,
      publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      author: p.author,
      category: p.category,
    };
  }

  private async getCategoryOrThrow(id: string) {
    const c = await this.prisma.blogCategory.findUnique({ where: { id } });
    if (!c) throw new NotFoundException('blog_category_not_found');
    return c;
  }

  private async uniquePostSlug(source: string, excludeId: string | null) {
    const base = slugify(source) || 'post';
    let slug = base;
    let n = 1;
    for (;;) {
      const found = await this.prisma.blogPost.findUnique({ where: { slug } });
      if (!found || found.id === excludeId) return slug;
      n += 1;
      slug = `${base}-${n}`;
    }
  }

  private async uniqueCategorySlug(source: string, excludeId: string | null) {
    const base = slugify(source) || 'category';
    let slug = base;
    let n = 1;
    for (;;) {
      const found = await this.prisma.blogCategory.findUnique({
        where: { slug },
      });
      if (!found || found.id === excludeId) return slug;
      n += 1;
      slug = `${base}-${n}`;
    }
  }
}
