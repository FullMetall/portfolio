"use client";

import { useRef, useState } from "react";

type GalleryItem = {
  readonly src: string;
  readonly alt: string;
  readonly caption: string;
  readonly width: number;
  readonly height: number;
};

export function CaseGallery({
  items,
  label,
  previousLabel,
  nextLabel,
  openLabel,
}: {
  items: readonly GalleryItem[];
  label: string;
  previousLabel: string;
  nextLabel: string;
  openLabel: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const pointerStart = useRef<number | null>(null);
  const activeItem = items[activeIndex];
  const orientation = activeItem.width > activeItem.height ? "landscape" : "portrait";

  const show = (index: number) => {
    setActiveIndex((index + items.length) % items.length);
  };

  return (
    <div
      className="case-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") show(activeIndex - 1);
        if (event.key === "ArrowRight") show(activeIndex + 1);
      }}
    >
      <figure className="case-carousel-slide" aria-live="polite">
        <div
          className={`case-carousel-media case-carousel-media-${orientation}`}
          onPointerDown={(event) => {
            pointerStart.current = event.clientX;
          }}
          onPointerUp={(event) => {
            if (pointerStart.current === null) return;
            const distance = event.clientX - pointerStart.current;
            pointerStart.current = null;
            if (Math.abs(distance) < 48) return;
            show(activeIndex + (distance < 0 ? 1 : -1));
          }}
          onPointerCancel={() => {
            pointerStart.current = null;
          }}
        >
          <button
            className="case-carousel-arrow case-carousel-arrow-previous"
            type="button"
            onClick={() => show(activeIndex - 1)}
            aria-label={previousLabel}
          >
            ←
          </button>
          {orientation === "portrait" && (
            <div className="case-carousel-portrait-copy" aria-hidden="true">
              <span>MOBILE FLOW</span>
              <strong>{activeItem.caption}</strong>
            </div>
          )}
          <a
            className="case-carousel-image-link"
            href={activeItem.src}
            target="_blank"
            rel="noreferrer"
            aria-label={`${openLabel}: ${activeItem.caption}`}
          >
            <img
              src={activeItem.src}
              alt={activeItem.alt}
              width={activeItem.width}
              height={activeItem.height}
              draggable="false"
            />
          </a>
          <button
            className="case-carousel-arrow case-carousel-arrow-next"
            type="button"
            onClick={() => show(activeIndex + 1)}
            aria-label={nextLabel}
          >
            →
          </button>
        </div>
        <figcaption>
          <span>{String(activeIndex + 1).padStart(2, "0")}</span>
          <strong>{activeItem.caption}</strong>
          <a href={activeItem.src} target="_blank" rel="noreferrer">
            {openLabel} ↗
          </a>
        </figcaption>
      </figure>

      <div className="case-carousel-footer">
        <div className="case-carousel-dots" aria-label={label}>
          {items.map((item, index) => (
            <button
              className={index === activeIndex ? "is-active" : ""}
              type="button"
              onClick={() => show(index)}
              aria-label={`${index + 1}: ${item.caption}`}
              aria-current={index === activeIndex ? "true" : undefined}
              key={item.src}
            />
          ))}
        </div>
        <span className="case-carousel-count">
          {String(activeIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
