import { PrayerForm } from "@/components/prayer-form";
import { Plus } from "lucide-react";
import { TaskList } from "@/components/task-list";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { TaskForm } from "@/components/task-form";
import { useState } from "react";


export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Phiếu điền cầu an, cầu siêu
          </h1>
        </div>
        <div className="max-w-2xl mx-auto">
          <PrayerForm />
        </div>
      </div>
    </div>
  );
}