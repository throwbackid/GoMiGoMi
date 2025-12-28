"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import Image from "next/image";
import { UploadDropzone } from "@/lib/uploadthing";

const conditions = [
  { value: "NEW", label: "New" },
  { value: "LIKE_NEW", label: "Like New" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
  { value: "POOR", label: "Poor" },
];

const lotterySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(0).max(2000),
  condition: z.enum(["NEW", "LIKE_NEW", "GOOD", "FAIR", "POOR"]),
  category: z.string().min(1, "Please select a category"),
  pointsPerEntry: z.number().min(1, "Minimum 1 point"),
  maxParticipants: z.number().min(1).optional(),
  endDate: z.string().min(1, "End date is required"),
});

type LotteryFormData = z.infer<typeof lotterySchema>;

interface LotteryFormProps {
  categories: { id: string; name: string; slug: string }[];
}

export function LotteryForm({ categories }: LotteryFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LotteryFormData>({
    resolver: zodResolver(lotterySchema),
    defaultValues: {
      pointsPerEntry: 10,
    },
  });

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: LotteryFormData) => {
    if (images.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/lotteries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          images,
          startDate: new Date().toISOString(),
          endDate: new Date(data.endDate).toISOString(),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create lottery");
      }

      const lottery = await res.json();
      toast.success("Lottery created!");
      router.push(`/lotteries/${lottery.id}`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Images */}
      <div className="space-y-2">
        <Label>Images (1-5)</Label>

        {images.length < 5 && (
          <UploadDropzone
            endpoint="lotteryImages"
            onClientUploadComplete={(res) => {
              const newUrls = res.map((file) => file.ufsUrl);
              setImages((prev) => [...prev, ...newUrls].slice(0, 5));
              toast.success(`${res.length} image(s) uploaded!`);
            }}
            onUploadError={(error: Error) => {
              toast.error(`Upload failed: ${error.message}`);
            }}
            config={{ mode: "auto" }}
            appearance={{
              container: "border-2 border-dashed rounded-lg p-6 cursor-pointer hover:border-primary/50 transition-colors",
              uploadIcon: "text-muted-foreground",
              label: "text-muted-foreground",
              allowedContent: "text-muted-foreground text-xs",
              button: "bg-primary text-primary-foreground hover:bg-primary/90",
            }}
          />
        )}

        {images.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-2">
            {images.map((img, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden">
                <Image src={img} alt="" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {images.length >= 5 && (
          <p className="text-sm text-muted-foreground">Maximum 5 images reached</p>
        )}
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register("title")} placeholder="What are you listing?" />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Describe your item in detail..."
          rows={4}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Condition & Category */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Condition</Label>
          <Select onValueChange={(v) => setValue("condition", v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              {conditions.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.condition && (
            <p className="text-sm text-destructive">{errors.condition.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select onValueChange={(v) => setValue("category", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-destructive">{errors.category.message}</p>
          )}
        </div>
      </div>

      {/* Points & End Date */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="pointsPerEntry">Entry Cost (points)</Label>
          <Input
            id="pointsPerEntry"
            type="number"
            min={1}
            {...register("pointsPerEntry", { valueAsNumber: true })}
          />
          {errors.pointsPerEntry && (
            <p className="text-sm text-destructive">{errors.pointsPerEntry.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="datetime-local"
            {...register("endDate")}
          />
          {errors.endDate && (
            <p className="text-sm text-destructive">{errors.endDate.message}</p>
          )}
        </div>
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Lottery
      </Button>
    </form>
  );
}