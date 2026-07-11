import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HtmlAttributes from "@/components/HtmlAttributes";
import ScrollProgress from "@/components/ScrollProgress";
import WhatsAppButton from "@/components/WhatsAppButton";
import BackToTop from "@/components/BackToTop";
import RobotMascot from "@/components/RobotMascot";
import IntroLoader from "@/components/IntroLoader";
import PageTransition from "@/components/PageTransition";
import { ToastProvider } from "@/components/Toast";
import CursorSpotlight from "@/components/CursorSpotlight";
import OfflineIndicator from "@/components/OfflineIndicator";
import PWAInstallBanner from "@/components/PWAInstallBanner";
import FloatingSectionDots from "@/components/FloatingSectionDots";
import CookieBanner from "@/components/CookieBanner";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "ar")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <ToastProvider>
        <div className="grain-overlay" aria-hidden />
        <HtmlAttributes />
        <CursorSpotlight />
        <IntroLoader />
        <ScrollProgress />
        <OfflineIndicator />
        <Navbar />
        <FloatingSectionDots />
        <PageTransition>{children}</PageTransition>
        <Footer />
        <WhatsAppButton />
        <BackToTop />
        <RobotMascot />
        <PWAInstallBanner />
        <CookieBanner />
      </ToastProvider>
    </NextIntlClientProvider>
  );
}
