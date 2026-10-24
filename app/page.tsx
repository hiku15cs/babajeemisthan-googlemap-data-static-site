"use client";

import { FormEvent, useState } from "react";
import shopData from "./data/shop.json";

type Review = {
  name: string;
  initials: string;
  detail: string;
  ago: string;
  rating: number;
  title?: string;
  comment: string;
  categories: string[];
  color: string;
  fresh?: boolean;
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5 text-amber-500" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <i
          key={index}
          className={`fa-${index < rating ? "solid" : "regular"} fa-star`}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

function ReviewCard({
  review,
  newReviewLabel,
}: {
  review: Review;
  newReviewLabel: string;
}) {
  return (
    <article
      className={`space-y-2 rounded-2xl border p-5 ${
        review.fresh
          ? "border-emerald-300 bg-emerald-50/40"
          : "border-stone-200 bg-stone-50/40"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${review.color} text-sm font-bold text-white shadow-sm`}>
            {review.initials}
          </div>
          <div>
            <p className="text-sm font-bold text-stone-900">{review.name}</p>
            <p className={`text-[11px] ${review.fresh ? "font-semibold text-emerald-700" : "text-stone-500"}`}>
              {review.fresh ? newReviewLabel : review.detail}
            </p>
          </div>
        </div>
        <span className="shrink-0 text-xs text-stone-400">{review.fresh ? "New" : review.ago}</span>
      </div>
      <Stars rating={review.rating} />
      {review.title && <p className="text-xs font-bold text-stone-900">{review.title}</p>}
      <p className="text-xs leading-relaxed text-stone-600">{review.comment}</p>
    </article>
  );
}

export default function Home() {
  const { shop, labels, sweets } = shopData;
  const [sweetIndex, setSweetIndex] = useState(0);
  const [weight, setWeight] = useState(1);
  const [customWeight, setCustomWeight] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [reviews, setReviews] = useState<Review[]>(shopData.reviewEntries);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState("");

  const orderWeight =
    customWeight.trim() === "" ? weight : Number(customWeight);
  const isValidOrderWeight =
    Number.isFinite(orderWeight) &&
    orderWeight >= labels.order.customWeightMin;
  const total = isValidOrderWeight
    ? Math.round(sweets[sweetIndex].price * orderWeight)
    : null;
  const weightLabel =
    orderWeight < 1
      ? `${Math.round(orderWeight * 1000)}g`
      : `${orderWeight}kg`;
  const orderMessage = encodeURIComponent(
    `Hello ${shop.name}, I want to order ${weightLabel} of ${sweets[sweetIndex].name} (Total: ₹${total}).`,
  );
  const visibleReviews = reviews.filter(
    (review) => activeFilter === "all" || review.categories.includes(activeFilter),
  );

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  }

  async function copyText(text: string, successMessage: string) {
    try {
      await navigator.clipboard.writeText(text);
      notify(successMessage);
    } catch {
      notify(labels.actions.copyFailure);
    }
  }

  async function shareShop() {
    const shareData = {
      title: `${shop.name} - Runni Saidpur`,
      text: shop.shareText,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          notify(labels.actions.shareFailure);
        }
      }
    } else {
      await copyText(window.location.href, labels.actions.websiteCopied);
    }
  }

  function quickSelectSweet(index: number) {
    setSweetIndex(index);
    document.getElementById("order-builder")?.scrollIntoView({ behavior: "smooth" });
    notify(`${labels.actions.quickSelectPrefix}${sweets[index].name}${labels.actions.quickSelectSuffix}`);
  }

  function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const comment = String(formData.get("comment") ?? "").trim();
    const rating = Number(formData.get("rating"));
    if (!name || !comment || rating < 1 || rating > 5) return;

    setReviews((current) => [
      {
        name,
        initials: name.slice(0, 2).toUpperCase(),
        detail: "",
        ago: "",
        rating,
        comment,
        categories: labels.reviews.newReviewCategories,
        color: labels.reviews.newReviewColor,
        fresh: true,
      },
      ...current,
    ]);
    setActiveFilter("all");
    setReviewOpen(false);
    event.currentTarget.reset();
    notify(labels.actions.reviewSubmitted);
  }

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      <div className="border-b border-amber-900/60 bg-heritage-dark px-4 py-2 text-xs text-amber-200">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-1 text-center sm:flex-row sm:gap-4 sm:text-left">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 animate-ping rounded-full bg-emerald-400" />
            <span className="font-medium">{labels.statusBar}</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-amber-300/80">
            <span><i className="fa-solid fa-store mr-1" />{labels.services[0]}</span>
            <span>·</span>
            <span><i className="fa-solid fa-box mr-1" />{labels.services[1]}</span>
            <span>·</span>
            <span><i className="fa-solid fa-truck-fast mr-1" />{labels.services[2]}</span>
          </div>
        </div>
      </div>

      <header className="relative isolate overflow-hidden bg-gradient-to-b from-heritage-dark via-heritage-russet to-heritage-terracotta px-4 pb-14 pt-8 text-white shadow-xl">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-10 [background-image:radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative z-10 mx-auto max-w-6xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold text-amber-200 backdrop-blur-md">
              <i className="fa-solid fa-award text-amber-400" />{shop.tagline}
            </div>
            <div className="flex items-center gap-3">
              <a href={shop.phoneLink} className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-1.5 text-xs font-bold text-stone-900 shadow-md transition hover:bg-amber-400">
                <i className="fa-solid fa-phone" />{shop.phone}
              </a>
              <button type="button" onClick={shareShop} aria-label={labels.accessibility.shareShop} className="rounded-full bg-white/10 p-2 text-xs text-white transition hover:bg-white/20">
                <i className="fa-solid fa-share-nodes" />
              </button>
              <button type="button" onClick={() => { setSaved(!saved); notify(saved ? labels.actions.unsaved : labels.actions.saved); }} aria-label={saved ? labels.accessibility.removeFavorite : labels.accessibility.saveFavorite} className="rounded-full bg-white/10 p-2 text-xs text-white transition hover:bg-white/20">
                <i className={`${saved ? "fa-solid" : "fa-regular"} fa-bookmark`} />
              </button>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="space-y-3">
              <h1 className="font-royal text-3xl font-extrabold tracking-wide text-amber-100 sm:text-5xl lg:text-6xl">{shop.name}</h1>
              <p className="font-hindi text-2xl font-bold tracking-wider text-amber-300 sm:text-3xl">{shop.hindiName}</p>
              <p className="max-w-xl text-sm font-light leading-relaxed text-stone-200">
                {shop.description}
              </p>
            </div>
            <div className="flex min-w-[280px] items-center gap-4 rounded-2xl border border-white/20 bg-white/10 p-4 shadow-lg backdrop-blur-md sm:p-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500 text-2xl font-black text-stone-950 shadow-inner">{shop.rating}</div>
              <div>
                <Stars rating={Math.floor(shop.rating)} />
                <p className="mt-0.5 text-xs font-semibold text-white">{shop.reviewCount} Google Reviews</p>
                <p className="text-[11px] text-amber-200/80">{shop.category}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <a href={shop.mapUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-stone-950 shadow-md transition hover:bg-amber-400 sm:text-sm">
              <i className="fa-solid fa-diamond-turn-right text-base" />{labels.headerButtons.directions}
            </a>
            <a href={`https://wa.me/${shop.whatsappNumber}?text=${encodeURIComponent(shop.whatsappGreeting)}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-emerald-500 sm:text-sm">
              <i className="fa-brands fa-whatsapp text-base" />{labels.headerButtons.whatsappOrder}
            </a>
            <button type="button" onClick={() => copyText(shop.fullAddress, labels.actions.addressCopied)} className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/20 sm:text-sm">
              <i className="fa-regular fa-copy" />{labels.headerButtons.copyAddress}
            </button>
          </div>
        </div>
      </header>

      <nav className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="no-scrollbar mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 py-2 text-xs font-semibold sm:gap-2 sm:text-sm">
          {labels.navigation.map(({ id, label }, index) => (
            <a key={id} href={`#${id}`} className={`whitespace-nowrap rounded-xl px-4 py-2 transition ${index === 0 ? "bg-heritage-russet text-white" : "text-stone-600 hover:bg-stone-100"}`}>
              {label}
            </a>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-6xl space-y-12 px-4 py-8">
        <section id="overview" className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {labels.overview.map((item) => (
            <div key={item.title} className="flex items-start gap-4 rounded-3xl border border-amber-900/10 bg-white p-6 shadow-sm">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${item.iconStyle}`}><i className={`fa-solid ${item.icon}`} /></div>
              <div><h2 className="text-base font-bold text-stone-900">{item.title}</h2><p className="mt-1 text-xs text-stone-600">{item.description}</p><span className="mt-2 inline-block rounded bg-stone-100 px-2 py-0.5 font-mono text-[11px] text-stone-700">{item.detail}</span></div>
            </div>
          ))}
        </section>

        <section id="menu" className="space-y-6">
          <div className="flex flex-col justify-between gap-3 border-b border-stone-200 pb-4 sm:flex-row sm:items-end">
            <div><span className="text-xs font-bold uppercase tracking-wider text-heritage-saffron">{labels.menu.eyebrow}</span><h2 className="mt-1 font-royal text-2xl font-bold text-stone-900 sm:text-3xl">{labels.menu.title}</h2></div>
            <div className="rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-semibold text-amber-800"><i className="fa-solid fa-star mr-1 text-amber-500" />{labels.menu.reviewNote}</div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {sweets.map((sweet, index) => (
              <article key={sweet.name} className={`group flex flex-col justify-between overflow-hidden rounded-3xl border ${sweet.borderStyle} bg-white shadow-sm transition-all duration-300 hover:shadow-lg`}>
                <div className="space-y-3 p-6">
                  <div className="flex items-start justify-between gap-2"><span className={`rounded-full px-3 py-1 text-[11px] font-bold ${sweet.badgeStyle}`}>{sweet.badge}</span><span className="whitespace-nowrap text-sm font-bold text-stone-900">₹{sweet.price} / kg</span></div>
                  <h3 className="font-royal text-lg font-bold text-stone-900 transition group-hover:text-heritage-saffron">{sweet.name}</h3>
                  <p className="text-xs leading-relaxed text-stone-600">{sweet.description}</p>
                  <div className={`flex items-center gap-2 pt-1 text-[11px] font-medium ${sweet.noteStyle}`}><i className="fa-solid fa-check" />{sweet.note}</div>
                </div>
                <div className="border-t border-stone-100 bg-stone-50 p-4">
                  <button type="button" onClick={() => quickSelectSweet(index)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-heritage-russet py-2.5 text-xs font-bold text-white transition hover:bg-heritage-dark"><i className="fa-solid fa-plus" />{labels.menu.selectButton}</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="order-builder" className="rounded-3xl bg-gradient-to-r from-stone-900 to-heritage-dark p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-lg space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300"><i className="fa-brands fa-whatsapp text-emerald-400" />{labels.order.eyebrow}</div>
              <h2 className="font-royal text-2xl font-bold text-amber-100 sm:text-3xl">{labels.order.title}</h2>
              <p className="text-xs leading-relaxed text-stone-300 sm:text-sm">{labels.order.description}</p>
            </div>
            <div className="w-full space-y-4 rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md lg:w-96">
              <div><label htmlFor="calcSweet" className="mb-1 block text-xs font-semibold text-amber-200">{labels.order.sweetLabel}</label><select id="calcSweet" value={sweetIndex} onChange={(event) => setSweetIndex(Number(event.target.value))} className="w-full rounded-xl border border-white/20 bg-stone-900 p-2.5 text-xs text-white focus:outline-none">{sweets.map((sweet, index) => <option key={sweet.name} value={index}>{sweet.name} (₹{sweet.price}/kg)</option>)}</select></div>
              <div>
                <p className="mb-1 block text-xs font-semibold text-amber-200">{labels.order.weightLabel}</p>
                <div className="grid grid-cols-3 gap-2">
                  {labels.order.weights.map(({ value: quantity, label }) => (
                    <button
                      key={quantity}
                      type="button"
                      onClick={() => {
                        setWeight(quantity);
                        setCustomWeight("");
                      }}
                      className={`rounded-xl border py-2 text-xs font-bold transition ${customWeight === "" && weight === quantity ? "border-amber-400 bg-amber-500 text-stone-950" : "border-white/20 bg-white/10 hover:bg-white/20"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="customWeight" className="mb-1 block text-xs font-semibold text-amber-200">
                  {labels.order.customWeightLabel}
                </label>
                <div className="relative">
                  <input
                    id="customWeight"
                    type="number"
                    min={labels.order.customWeightMin}
                    step={labels.order.customWeightStep}
                    value={customWeight}
                    onChange={(event) => setCustomWeight(event.target.value)}
                    placeholder="e.g. 1.5"
                    aria-describedby="customWeightHint"
                    aria-invalid={customWeight !== "" && !isValidOrderWeight}
                    className="w-full rounded-xl border border-white/20 bg-stone-900 p-2.5 pr-12 text-xs text-white placeholder:text-stone-500 focus:outline-none"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-stone-400">kg</span>
                </div>
                <p id="customWeightHint" className="mt-1 text-[11px] text-stone-400">
                  {customWeight !== "" && !isValidOrderWeight
                    ? labels.order.invalidWeight
                    : labels.order.customWeightHint}
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-2">
                <div>
                  <p className="text-[11px] text-stone-400">{labels.order.totalLabel}</p>
                  <p className="text-xl font-bold text-amber-300">
                    {total === null ? "—" : `₹${total}`}
                  </p>
                </div>
                {isValidOrderWeight ? (
                  <a href={`https://wa.me/${shop.whatsappNumber}?text=${orderMessage}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-stone-950 shadow-md transition hover:bg-emerald-400">
                    <i className="fa-brands fa-whatsapp text-base" />{labels.order.sendButton}
                  </a>
                ) : (
                  <button type="button" disabled className="flex cursor-not-allowed items-center gap-2 rounded-xl bg-emerald-900 px-4 py-2.5 text-xs font-bold text-stone-300 opacity-60">
                    <i className="fa-brands fa-whatsapp text-base" />{labels.order.sendButton}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="popular-times" className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 rounded-3xl border border-amber-900/10 bg-white p-6 shadow-sm sm:p-8 lg:col-span-2">
            <div className="flex items-center justify-between"><div><h2 className="flex items-center gap-2 font-royal text-xl font-bold text-stone-900"><i className="fa-solid fa-chart-column text-heritage-saffron" />{labels.popularTimes.title}</h2><p className="mt-0.5 text-xs text-stone-500">{labels.popularTimes.description}</p></div><span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">{labels.popularTimes.day}</span></div>
            <div className="pt-6"><div className="flex h-44 items-end justify-between gap-3 border-b border-stone-200 px-2">{labels.popularTimes.bars.map((bar) => <div key={bar.time} className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5"><div className={`relative w-full rounded-t-lg transition-all ${bar.peak ? "bg-heritage-saffron" : "bg-amber-300 group-hover:bg-amber-500"}`} style={{ height: bar.height }}>{bar.peak && <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-heritage-russet px-1.5 py-0.5 text-[10px] font-bold text-white shadow">{labels.popularTimes.peakLabel}</span>}</div><span className={`text-xs ${bar.peak ? "font-bold text-heritage-saffron" : "text-stone-500"}`}>{bar.time}</span></div>)}</div><p className="mt-4 text-center text-xs text-stone-500">{labels.popularTimes.footfallNote}</p></div>
          </div>
          <div className="flex flex-col justify-between rounded-3xl border border-amber-200/80 bg-amber-50/70 p-6 sm:p-8">
            <div><div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-xl text-stone-950 shadow-sm"><i className="fa-solid fa-car" /></div><h2 className="font-royal text-lg font-bold text-stone-900">{labels.popularTimes.parkingTitle}</h2><p className="mt-2 text-xs italic leading-relaxed text-stone-700">{labels.popularTimes.parkingQuote}</p><div className="mt-4 space-y-2 text-xs text-stone-700">{labels.popularTimes.parkingTips.map((tip) => <div key={tip} className="flex items-center gap-2"><i className="fa-solid fa-circle-check text-emerald-600" />{tip}</div>)}</div></div>
            <a href={shop.phoneLink} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-heritage-russet py-3 text-xs font-bold text-white shadow transition hover:bg-stone-900"><i className="fa-solid fa-phone-volume" />{labels.popularTimes.callButton}</a>
          </div>
        </section>

        <section id="reviews" className="space-y-8 rounded-3xl border border-amber-900/10 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-4 border-b border-stone-100 pb-6 sm:flex-row sm:items-center"><div><span className="text-xs font-bold uppercase tracking-wider text-heritage-saffron">{labels.reviews.eyebrow}</span><h2 className="mt-0.5 font-royal text-2xl font-bold text-stone-900">{shop.reviewCount} Customer Reviews</h2></div><button type="button" onClick={() => setReviewOpen(true)} className="flex self-start items-center gap-2 rounded-xl bg-heritage-russet px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-stone-900 sm:self-auto"><i className="fa-solid fa-pen-to-square" />{labels.reviews.writeButton}</button></div>

          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-amber-200/60 bg-amber-50/60 p-6 text-center"><div className="text-6xl font-black text-stone-900">{shop.rating}</div><div className="my-2 flex justify-center"><Stars rating={Math.floor(shop.rating)} /></div><p className="text-xs font-bold text-stone-600">{labels.reviews.scoreLabel}</p></div>
            <div className="space-y-2 text-xs md:col-span-2">{labels.reviews.distribution.map(({ rating, percentage }) => <div key={rating} className="flex items-center gap-3"><span className="w-3 font-bold text-stone-600">{rating}</span><div className="h-2.5 flex-1 overflow-hidden rounded-full bg-stone-100"><div className="h-2.5 rounded-full bg-amber-500" style={{width:`${percentage}%`}} /></div><span className="w-10 text-right text-stone-400">{percentage}%</span></div>)}</div>
          </div>

          <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">{labels.reviews.highlights.map((highlight) => <div key={highlight.quote} className={`rounded-2xl border p-3.5 ${highlight.style}`}><i className={`fa-solid fa-quote-left mr-1.5 ${highlight.iconStyle}`} /><strong>{highlight.quote}</strong></div>)}</div>

          <div className="flex flex-wrap gap-2 border-t border-stone-100 pt-2">{labels.reviews.filters.map((filter) => <button key={filter.value} type="button" onClick={() => setActiveFilter(filter.value)} className={`rounded-full px-4 py-1.5 text-xs transition ${activeFilter === filter.value ? "bg-stone-900 font-bold text-white" : "bg-stone-100 font-semibold text-stone-700 hover:bg-stone-200"}`}>{filter.label}</button>)}</div>
          <div className="space-y-4">
            {visibleReviews.map((review, index) => <ReviewCard key={`${review.name}-${index}`} review={review} newReviewLabel={labels.reviews.newReviewLabel} />)}
            {activeFilter === "all" && <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4 text-xs text-stone-700"><div className="flex items-center gap-2"><i className="fa-solid fa-comment text-heritage-saffron" /><span>{labels.reviews.visitorUpdate}</span></div><span className="shrink-0 text-[11px] text-stone-400">{labels.reviews.visitorUpdateAge}</span></div>}
          </div>
        </section>

        <section id="location" className="space-y-6 rounded-3xl border border-amber-900/15 bg-gradient-to-br from-white to-amber-50/50 p-6 shadow-sm sm:p-10">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-xl space-y-3"><span className="text-xs font-bold uppercase tracking-wider text-heritage-saffron">{labels.location.eyebrow}</span><h2 className="font-royal text-2xl font-bold text-stone-900 sm:text-3xl">{labels.location.title}</h2><p className="text-xs leading-relaxed text-stone-600 sm:text-sm">{labels.location.description}</p><div className="flex flex-wrap items-center gap-3 pt-1 text-xs"><span className="rounded-xl bg-stone-900 px-3 py-1.5 font-mono font-bold text-amber-300">{labels.location.plusCodeLabel} {shop.plusCode} Runni Saidpur</span><span className="rounded-xl bg-emerald-100 px-3 py-1.5 font-semibold text-emerald-800">{labels.location.hoursLabel}</span></div></div>
            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto"><a href={shop.mapUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-2xl bg-heritage-russet px-6 py-3.5 text-xs font-bold text-white shadow-md transition hover:bg-stone-900 sm:text-sm"><i className="fa-solid fa-location-arrow" />{labels.location.mapButton}</a><button type="button" onClick={() => copyText(shop.fullAddress, labels.actions.addressCopied)} className="flex items-center justify-center gap-2 rounded-2xl border border-stone-300 bg-white px-6 py-3.5 text-xs font-bold text-stone-800 shadow-sm transition hover:bg-stone-50 sm:text-sm"><i className="fa-regular fa-copy" />{labels.headerButtons.copyAddress}</button></div>
          </div>
        </section>
      </main>

      {reviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setReviewOpen(false); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="review-title" className="w-full max-w-md space-y-4 rounded-3xl border border-stone-100 bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3"><h3 id="review-title" className="font-royal text-lg font-bold text-stone-900">{labels.reviews.form.title}</h3><button type="button" onClick={() => setReviewOpen(false)} aria-label={labels.actions.closeReviewForm} className="text-xl text-stone-400 hover:text-stone-700"><i className="fa-solid fa-xmark" /></button></div>
            <form onSubmit={submitReview} className="space-y-4">
              <div><label htmlFor="custName" className="mb-1 block text-xs font-bold text-stone-700">{labels.reviews.form.nameLabel}</label><input id="custName" name="name" required maxLength={80} className="w-full rounded-xl border border-stone-300 p-3 text-xs focus:outline-heritage-saffron" placeholder={labels.reviews.form.namePlaceholder} /></div>
              <div><label htmlFor="custRating" className="mb-1 block text-xs font-bold text-stone-700">{labels.reviews.form.ratingLabel}</label><select id="custRating" name="rating" className="w-full rounded-xl border border-stone-300 p-3 text-xs focus:outline-heritage-saffron">{labels.reviews.form.ratingOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
              <div><label htmlFor="custComment" className="mb-1 block text-xs font-bold text-stone-700">{labels.reviews.form.commentLabel}</label><textarea id="custComment" name="comment" rows={3} required maxLength={1000} className="w-full rounded-xl border border-stone-300 p-3 text-xs focus:outline-heritage-saffron" placeholder={labels.reviews.form.commentPlaceholder} /></div>
              <div className="flex gap-3 pt-2"><button type="button" onClick={() => setReviewOpen(false)} className="flex-1 rounded-xl border border-stone-300 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50">{labels.reviews.form.cancelButton}</button><button type="submit" className="flex-1 rounded-xl bg-heritage-russet py-2.5 text-xs font-bold text-white transition hover:bg-stone-900">{labels.reviews.form.submitButton}</button></div>
            </form>
          </div>
        </div>
      )}

      <div role="status" aria-live="polite" className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-2xl bg-stone-900 px-5 py-3 text-xs font-semibold text-amber-200 shadow-xl transition-all duration-300 ${toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-24 opacity-0"}`}>
        <i className="fa-solid fa-circle-check text-base text-emerald-400" />{toast || "Action completed"}
      </div>

      <footer className="mt-16 border-t border-amber-950 bg-heritage-dark px-4 py-10 text-center text-xs text-stone-400">
        <div className="mx-auto max-w-6xl space-y-3"><h3 className="font-royal text-lg font-bold text-amber-200">{shop.name}</h3><p className="font-hindi text-base text-amber-400">{labels.footer.hindiLocation}</p><p className="text-stone-300">{shop.address} · {labels.actions.phoneLabel} {shop.phone}</p><p className="mx-auto max-w-md border-t border-white/5 pt-2 text-[11px] text-stone-500">{labels.footer.verification} ({shop.rating} ★, {shop.reviewCount} Reviews)</p></div>
      </footer>
    </div>
  );
}
