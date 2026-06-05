"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuth } from "@/features/auth/hooks";
import { dashboardPathForRole } from "@/features/auth/roles";
import { BildirishnomalarTab } from "@/features/users/components/BildirishnomalarTab";
import { HisobTab } from "@/features/users/components/HisobTab";
import { MaxfiylikTab } from "@/features/users/components/MaxfiylikTab";
import { ProfilTab } from "@/features/users/components/ProfilTab";
import { TilTab } from "@/features/users/components/TilTab";

export default function SozlamalarPage() {
  const { data: user } = useAuth();
  const backHref = user ? dashboardPathForRole(user.role) : "/";

  return (
    <main className="min-h-screen bg-ilm-paper px-6 py-12 lg:px-12">
      <div className="mx-auto flex max-w-3xl flex-col gap-sp-6">
        <header className="flex flex-col gap-2">
          <Link
            href={backHref}
            className="flex items-center gap-1.5 text-t-12 font-medium text-fg-3 transition-colors hover:text-ilm-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            Orqaga
          </Link>
          <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink">
            Sozlamalar
          </h1>
        </header>

        <Tabs defaultValue="profil" className="flex flex-col gap-sp-4">
          <TabsList>
            <TabsTrigger value="profil">Profil</TabsTrigger>
            <TabsTrigger value="hisob">Hisob</TabsTrigger>
            <TabsTrigger value="bildirishnomalar">Bildirishnomalar</TabsTrigger>
            <TabsTrigger value="maxfiylik">Maxfiylik</TabsTrigger>
            <TabsTrigger value="til">Til</TabsTrigger>
          </TabsList>

          <TabsContent value="profil">
            <ProfilTab />
          </TabsContent>
          <TabsContent value="hisob">
            <HisobTab />
          </TabsContent>
          <TabsContent value="bildirishnomalar">
            <BildirishnomalarTab />
          </TabsContent>
          <TabsContent value="maxfiylik">
            <MaxfiylikTab />
          </TabsContent>
          <TabsContent value="til">
            <TilTab />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
