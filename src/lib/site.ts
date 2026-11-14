/**
 * Verified business data for Kalimeris O.E.
 * Source: https://kalimeriscars.gr/ (home, /contact, /etaireia, /rent-a-car,
 * /synergeio), scraped with Firecrawl. Prices, availability and rental terms
 * are deliberately absent.
 */
export type SiteHour = {
  daysEl: string;
  daysEn: string;
  timeEl: string;
  timeEn: string;
};

export const siteHours: readonly SiteHour[] = [
  {
    daysEl: "Δευτέρα – Παρασκευή",
    daysEn: "Monday – Friday",
    timeEl: "9:00 π.μ. – 7:30 μ.μ.",
    timeEn: "9:00 am – 7:30 pm"
  },
  {
    daysEl: "Σάββατο",
    daysEn: "Saturday",
    timeEl: "9:00 π.μ. – 1:00 μ.μ.",
    timeEn: "9:00 am – 1:00 pm"
  }
];

export const site = {
  legalNameEl: "ΚΑΛΗΜΕΡΗΣ ΚΑΙ ΣΙΑ Ο.Ε.",
  legalNameEn: "KALIMERIS & SIA O.E.",
  tradingNameEl: "ΚΑΛΗΜΕΡΗΣ Ο.Ε.",
  tradingNameEn: "Kalimeris O.E.",
  activityEl: "Εμπορία αυτοκινήτων · Bosch Car Service · Ανταλλακτικά · Rent a car",
  activityEn: "Car sales · Bosch Car Service · Parts · Car rental",
  address: {
    streetEl: "3ο χλμ. Κοζάνης – Θεσσαλονίκης",
    streetEn: "3rd km Kozani – Thessaloniki",
    postalCode: "50100",
    cityEl: "Κοζάνη",
    cityEn: "Kozani",
    fullEl: "3ο χλμ. Κοζάνης – Θεσσαλονίκης, 50100 Κοζάνη",
    fullEn: "3rd km Kozani – Thessaloniki, 501 00 Kozani, Greece"
  },
  phone: {display: "24610 28779", href: "tel:+302461028779"},
  reservationsPhone: {display: "694 818 1888", href: "tel:+306948181888"},
  reservationsManagerEl: "Καλημέρης Πασχάλης",
  reservationsManagerEn: "Paschalis Kalimeris",
  email: "info@kalimeriscars.gr",
  serviceEmail: "Kalimerisbcs@gmail.com",
  vat: "099768245",
  gemi: "11036836000",
  foundedYear: 1980,
  hours: siteHours,
  social: {
    facebook: "https://www.facebook.com/jkallimeris",
    tiktok: "https://www.tiktok.com/@kalimeris_cars"
  },
  carGr: {
    cars: "https://kalimeris.car.gr/cars/",
    parts: "https://kalimeris.car.gr/parts"
  },
  workshop: {
    areaSqm: 600,
    serviceBays: 10,
    europeWorkshops: 6000,
    worldwideWorkshops: 11000
  }
} as const;

export function getSiteAddress(locale: string): string {
  return locale === "el" ? site.address.fullEl : site.address.fullEn;
}

export function directionsUrl(locale: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    getSiteAddress(locale)
  )}`;
}
