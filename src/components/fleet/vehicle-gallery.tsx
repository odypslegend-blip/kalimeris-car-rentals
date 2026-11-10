"use client";

import * as React from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import {ChevronLeft, ChevronRight} from "lucide-react";
import {useLocale, useTranslations} from "next-intl";
import {Badge} from "@/components/ui/badge";
import {assetPath} from "@/lib/base-path";
import type {VehicleGalleryImage} from "@/lib/data/fleet";
import {cn} from "@/lib/utils";

type VehicleGalleryProps = {
  images: readonly VehicleGalleryImage[];
  className?: string;
};

/**
 * Embla v8 gallery (verified against the installed 8.6.0 API:
 * `selectedScrollSnap`, `scrollTo`, `canScrollPrev/Next`, `on("select")`).
 * The main viewport, thumbnails and keyboard all drive one instance.
 */
export function VehicleGallery({images, className}: VehicleGalleryProps) {
  const locale = useLocale();
  const t = useTranslations("Vehicle");
  const common = useTranslations("Common");
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start"
  });
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  React.useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!emblaApi) return;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      emblaApi.scrollPrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      emblaApi.scrollNext();
    } else if (event.key === "Home") {
      event.preventDefault();
      emblaApi.scrollTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      emblaApi.scrollTo(images.length - 1);
    }
  }

  const total = images.length;

  return (
    <div className={cn("min-w-0", className)}>
      <div
        ref={emblaRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={t("galleryLabel")}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="overflow-hidden rounded-card border border-line bg-surface shadow-card"
      >
        <div className="flex touch-pan-y">
          {images.map((image, index) => (
            <div
              key={`${image.src}-${index}`}
              role="group"
              aria-roledescription="slide"
              aria-label={t("photoOf", {current: index + 1, total})}
              aria-hidden={index !== selectedIndex}
              className="relative min-w-0 shrink-0 grow-0 basis-full"
            >
              <div className="relative aspect-[16/10] bg-background">
                <Image
                  src={assetPath(image.src)}
                  alt={locale === "el" ? image.altEl : image.altEn}
                  fill
                  priority={index === 0}
                  quality={90}
                  sizes="(min-width: 1024px) 62vw, 100vw"
                  className="object-cover"
                />
                <Badge
                  variant="demo"
                  className="absolute left-3 top-3 shadow-sm"
                >
                  {common("demo")}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        {t("photoOf", {current: selectedIndex + 1, total})}
      </p>

      <div className="mt-3 flex items-center gap-3">
        <div
          className="grid min-w-0 flex-1 gap-2 sm:gap-3"
          style={{gridTemplateColumns: `repeat(${images.length}, minmax(0, 1fr))`}}
        >
          {images.map((image, index) => {
            const isSelected = index === selectedIndex;

            return (
              <button
                key={`${image.src}-thumb-${index}`}
                type="button"
                onClick={() => emblaApi?.scrollTo(index)}
                aria-label={t("photoOf", {current: index + 1, total})}
                aria-pressed={isSelected}
                className={cn(
                  "relative aspect-[3/2] overflow-hidden rounded-field border-2 bg-background transition-colors duration-[var(--token-duration-fast)] ease-brand",
                  isSelected
                    ? "border-brand"
                    : "border-line hover:border-brand/50"
                )}
              >
                <Image
                  src={assetPath(image.src)}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 18vw, 30vw"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canScrollPrev}
            aria-label={t("previousImage")}
            className="inline-flex size-11 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors duration-[var(--token-duration-fast)] ease-brand hover:border-brand hover:text-brand disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canScrollNext}
            aria-label={t("nextImage")}
            className="inline-flex size-11 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors duration-[var(--token-duration-fast)] ease-brand hover:border-brand hover:text-brand disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
