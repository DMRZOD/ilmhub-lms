"use client";

import * as React from "react";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ADMIN_CMS_TEXT as T } from "@/features/admin/labels";

import { HeroForm, StatsForm } from "./hero-stats-forms";
import { TestimonialsManager } from "./testimonials-manager";
import { FaqManager } from "./faq-manager";

export function HomeContent() {
  return (
    <Tabs defaultValue="hero" className="flex flex-col gap-sp-4">
      <TabsList>
        <TabsTrigger value="hero">{T.home.hero}</TabsTrigger>
        <TabsTrigger value="stats">{T.home.stats}</TabsTrigger>
        <TabsTrigger value="testimonials">{T.home.testimonials}</TabsTrigger>
        <TabsTrigger value="faq">{T.home.faq}</TabsTrigger>
      </TabsList>

      <TabsContent value="hero" className="flex flex-col gap-sp-4">
        <HeroForm />
        <Card padding="md" className="bg-ilm-surface text-t-13 text-fg-2">
          {T.home.featuredNote}
        </Card>
      </TabsContent>

      <TabsContent value="stats">
        <StatsForm />
      </TabsContent>

      <TabsContent value="testimonials">
        <TestimonialsManager />
      </TabsContent>

      <TabsContent value="faq">
        <FaqManager />
      </TabsContent>
    </Tabs>
  );
}
