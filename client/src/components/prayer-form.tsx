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
import { Plus, Trash2, Upload, Save, Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  const [editingPrayer, setEditingPrayer] = useState<Prayer | null>(null);

  const form = useForm({
    resolver: zodResolver(insertPrayerSchema),
    defaultValues: editingPrayer || defaultPrayer,
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
    setEditingPrayer(null);
    toast({ title: "Đã thêm vào danh sách và tạo mới" });
  };

  const clearLocalList = () => {
    setSavedLocally([]);
    toast({ title: "Đã xóa danh sách" });
  };

  const removeItem = (id: number) => {
    setSavedLocally(prev => prev.filter(item => item.id !== id));
    toast({ title: "Đã xóa thông tin" });
  };

  const editItem = (prayer: Prayer) => {
    setEditingPrayer(prayer);
    form.reset(prayer);
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

          <div className="flex flex-col space-y-8">
            {/* Danh sách cầu an */}
            <div className="space-y-4">
              <h4 className="font-medium text-primary">Danh sách cầu an</h4>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Họ và tên</TableHead>
                      <TableHead>Năm sinh</TableHead>
                      <TableHead>Địa chỉ</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {savedLocally
                      .filter(prayer => prayer.prayerType === "alive")
                      .map((prayer) => (
                        <TableRow key={prayer.id}>
                          <TableCell className="font-medium">{prayer.fullName}</TableCell>
                          <TableCell>{prayer.birthYear}</TableCell>
                          <TableCell>{prayer.address}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => editItem(prayer)}
                                className="h-8 w-8"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem(prayer.id)}
                                className="h-8 w-8 text-destructive hover:text-destructive/90"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    {savedLocally.filter(prayer => prayer.prayerType === "alive").length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          Chưa có thông tin cầu an
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Danh sách cầu siêu */}
            <div className="space-y-4">
              <h4 className="font-medium text-primary">Danh sách cầu siêu</h4>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Họ và tên</TableHead>
                      <TableHead>Năm sinh</TableHead>
                      <TableHead>Năm mất</TableHead>
                      <TableHead>Nơi an táng</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {savedLocally
                      .filter(prayer => prayer.prayerType === "deceased")
                      .map((prayer) => (
                        <TableRow key={prayer.id}>
                          <TableCell className="font-medium">{prayer.fullName}</TableCell>
                          <TableCell>{prayer.birthYear}</TableCell>
                          <TableCell>{prayer.deathYear}</TableCell>
                          <TableCell>{prayer.burialLocation}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => editItem(prayer)}
                                className="h-8 w-8"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem(prayer.id)}
                                className="h-8 w-8 text-destructive hover:text-destructive/90"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    {savedLocally.filter(prayer => prayer.prayerType === "deceased").length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          Chưa có thông tin cầu siêu
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}