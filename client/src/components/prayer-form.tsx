import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPrayerSchema, type Prayer } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PrayerFormProps {
  onSuccess?: () => void;
}

const defaultPrayer = {
  fullName: "",
  prayerType: "alive",
  birthYear: new Date().getFullYear(),
  address: "",
  deathYear: undefined,
  burialLocation: "",
};

export function PrayerForm({ onSuccess }: PrayerFormProps) {
  const { toast } = useToast();
  const [savedLocally, setSavedLocally] = useState<Prayer[]>([]);
  
  const form = useForm({
    resolver: zodResolver(insertPrayerSchema),
    defaultValues: defaultPrayer,
  });

  const prayerType = form.watch("prayerType");

  const mutation = useMutation({
    mutationFn: async (data: typeof form.getValues) => {
      return apiRequest("POST", "/api/prayers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayers"] });
      toast({ title: "Đã lưu thông tin thành công" });
      form.reset(defaultPrayer);
      onSuccess?.();
    },
    onError: () => {
      toast({ 
        title: "Lỗi",
        description: "Không thể lưu thông tin",
        variant: "destructive"
      });
    },
  });

  const saveLocally = () => {
    const values = form.getValues();
    setSavedLocally(prev => [...prev, { ...values, id: prev.length + 1 }]);
    toast({ title: "Đã lưu tạm thời" });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Họ và tên</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="prayerType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loại cầu nguyện</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="alive">Cầu an</SelectItem>
                  <SelectItem value="deceased">Cầu siêu</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="birthYear"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Năm sinh</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {prayerType === "alive" && (
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Địa chỉ</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {prayerType === "deceased" && (
          <>
            <FormField
              control={form.control}
              name="deathYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Năm mất</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="burialLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nơi an táng</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={saveLocally}>
            Lưu tạm
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Đang lưu..." : "Gửi lên server"}
          </Button>
        </div>
      </form>

      {savedLocally.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold mb-4">Danh sách đã lưu tạm ({savedLocally.length})</h3>
          <div className="space-y-2">
            {savedLocally.map((prayer, index) => (
              <div key={index} className="p-4 border rounded">
                <p>Họ tên: {prayer.fullName}</p>
                <p>Loại: {prayer.prayerType === "alive" ? "Cầu an" : "Cầu siêu"}</p>
                <p>Năm sinh: {prayer.birthYear}</p>
                {prayer.prayerType === "alive" && <p>Địa chỉ: {prayer.address}</p>}
                {prayer.prayerType === "deceased" && (
                  <>
                    <p>Năm mất: {prayer.deathYear}</p>
                    <p>Nơi an táng: {prayer.burialLocation}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Form>
  );
}
