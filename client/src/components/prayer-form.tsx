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
import { Plus, Trash2, Upload, Save } from "lucide-react";

interface PrayerFormProps {
  onSuccess?: () => void;
}

const defaultPrayer = {
  fullName: "",
  prayerType: "alive",
  birthYear: new Date().getFullYear(),
  address: "",
  deathYear: null,
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
    mutationFn: async () => {
      // Send all saved prayers to server
      for (const prayer of savedLocally) {
        await apiRequest("POST", "/api/prayers", prayer);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayers"] });
      toast({ title: "Đã lưu tất cả thông tin thành công" });
      setSavedLocally([]); // Clear the list after successful upload
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
    if (!values.fullName) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập họ tên",
        variant: "destructive"
      });
      return;
    }
    setSavedLocally(prev => [...prev, { ...values, id: prev.length + 1 }]);
    toast({ title: "Đã lưu vào danh sách" });
  };

  const addNewForm = () => {
    const values = form.getValues();
    if (!values.fullName) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập họ tên trước khi tạo mới",
        variant: "destructive"
      });
      return;
    }
    setSavedLocally(prev => [...prev, { ...values, id: prev.length + 1 }]);
    form.reset(defaultPrayer);
    toast({ title: "Đã thêm vào danh sách và tạo mới" });
  };

  const clearLocalList = () => {
    setSavedLocally([]);
    toast({ title: "Đã xóa danh sách" });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={(e) => {
          e.preventDefault();
          if (savedLocally.length === 0) {
            toast({
              title: "Lỗi",
              description: "Danh sách đang trống",
              variant: "destructive"
            });
            return;
          }
          mutation.mutate();
        }} className="space-y-4">
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

          <div className="flex gap-2 flex-wrap">
            <Button type="button" variant="outline" onClick={addNewForm}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo mới
            </Button>
            <Button type="button" variant="outline" onClick={saveLocally}>
              <Save className="h-4 w-4 mr-2" />
              Lưu tạm
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              <Upload className="h-4 w-4 mr-2" />
              {mutation.isPending ? "Đang lưu..." : "Gửi lên server"}
            </Button>
          </div>
        </form>
      </Form>

      {savedLocally.length > 0 && (
        <div className="mt-8 space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">Danh sách đã lưu ({savedLocally.length})</h3>
            <Button variant="destructive" size="sm" onClick={clearLocalList}>
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa danh sách
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Danh sách cầu an */}
            <div className="space-y-4">
              <h4 className="font-medium text-primary">Danh sách cầu an</h4>
              {savedLocally
                .filter(prayer => prayer.prayerType === "alive")
                .map((prayer, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-background">
                    <div className="space-y-2">
                      <p className="font-medium">{prayer.fullName}</p>
                      <div className="text-sm text-muted-foreground">
                        <p>Năm sinh: {prayer.birthYear}</p>
                        {prayer.address && <p>Địa chỉ: {prayer.address}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              {savedLocally.filter(prayer => prayer.prayerType === "alive").length === 0 && (
                <p className="text-sm text-muted-foreground italic">Chưa có thông tin cầu an</p>
              )}
            </div>

            {/* Danh sách cầu siêu */}
            <div className="space-y-4">
              <h4 className="font-medium text-primary">Danh sách cầu siêu</h4>
              {savedLocally
                .filter(prayer => prayer.prayerType === "deceased")
                .map((prayer, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-background">
                    <div className="space-y-2">
                      <p className="font-medium">{prayer.fullName}</p>
                      <div className="text-sm text-muted-foreground">
                        <p>Năm sinh: {prayer.birthYear}</p>
                        <p>Năm mất: {prayer.deathYear}</p>
                        <p>Nơi an táng: {prayer.burialLocation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              {savedLocally.filter(prayer => prayer.prayerType === "deceased").length === 0 && (
                <p className="text-sm text-muted-foreground italic">Chưa có thông tin cầu siêu</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}