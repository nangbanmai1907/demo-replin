import { TaskList } from "@/components/task-list";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { TaskForm } from "@/components/task-form";
import { useState } from "react";
import { PlusCircle } from "lucide-react";

export default function Home() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            App Reminder Demo
          </h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <TaskForm onSuccess={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
        <TaskList />
      </div>
    </div>
  );
}