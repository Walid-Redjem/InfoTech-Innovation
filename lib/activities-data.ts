import { ImageIcon, Video, Layers, BookOpen, LucideIcon } from "lucide-react";

export type ActivityType = "photos" | "video" | "projects" | "blog";

export interface Activity {
  slug: string;
  icon: LucideIcon;
  type: ActivityType;
  gradient: string;
  iconBg: string;
  coverImage?: string;
  badgeImage?: string;
  badgePosition?: string;
  cardPosition?: string;
  typeEn: string;
  typeAr: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  dateEn: string;
  dateAr: string;
  dots: string[];
  mediaItems: never[];
}

export const activities: Activity[] = [
  {
    slug: "workshop-highlights",
    icon: ImageIcon,
    type: "photos",
    gradient: "linear-gradient(135deg, #6B35A0 0%, #9B6B9B 60%, #C084FC 100%)",
    iconBg: "#6B35A0",
    coverImage: "/activity-workshop-highlights.jpg",
    badgeImage: "/activity-workshop-highlights.jpg",
    cardPosition: "35% 20%",
    typeEn: "Photos", typeAr: "صور",
    titleEn: "Workshop Highlights", titleAr: "أبرز ورشات العمل",
    descEn: "A look back at our hands-on technical workshops and training sessions.",
    descAr: "لمحة عن ورشاتنا التقنية العملية وجلساتنا التدريبية.",
    dateEn: "Coming soon", dateAr: "قريباً",
    dots: ["top-4 left-6", "top-8 right-10", "bottom-6 left-12", "bottom-4 right-6"],
    mediaItems: [],
  },
  {
    slug: "community-sessions",
    icon: Video,
    type: "video",
    gradient: "linear-gradient(135deg, #2EC4B6 0%, #0D9488 55%, #99F6E4 100%)",
    iconBg: "#0D9488",
    typeEn: "Video", typeAr: "فيديو",
    titleEn: "Community Sessions", titleAr: "الجلسات المجتمعية",
    descEn: "Recorded sessions from our community meetings and collaborative events.",
    descAr: "تسجيلات جلساتنا المجتمعية والفعاليات التشاركية.",
    dateEn: "Coming soon", dateAr: "قريباً",
    dots: ["top-6 right-8", "top-12 left-4", "bottom-8 right-12", "bottom-3 left-8"],
    mediaItems: [],
  },
  {
    slug: "our-projects",
    icon: Layers,
    type: "projects",
    gradient: "linear-gradient(135deg, #DC2626 0%, #EF4444 55%, #FCA5A5 100%)",
    iconBg: "#DC2626",
    coverImage: "/activity-our-projects.jpg",
    badgeImage: "/activity-our-projects.jpg",
    cardPosition: "center 15%",
    typeEn: "Projects", typeAr: "مشاريع",
    titleEn: "Our Projects", titleAr: "مشاريعنا",
    descEn: "Discover the initiatives and projects our community is building across Algeria.",
    descAr: "اكتشف المبادرات والمشاريع التي يبنيها مجتمعنا في الجزائر.",
    dateEn: "Ongoing", dateAr: "جارية",
    dots: ["top-3 left-10", "top-10 right-4", "bottom-5 left-5", "bottom-10 right-9"],
    mediaItems: [],
  },
  {
    slug: "innovation-stories",
    icon: BookOpen,
    type: "blog",
    gradient: "linear-gradient(135deg, #F97316 0%, #FB923C 55%, #FED7AA 100%)",
    iconBg: "#EA6A0A",
    coverImage: "/activity-innovation-stories.jpg",
    badgeImage: "/activity-innovation-stories.jpg",
    cardPosition: "28% 35%",
    typeEn: "Blog", typeAr: "مقال",
    titleEn: "Innovation Stories", titleAr: "قصص الابتكار",
    descEn: "Stories of youth and institutions driving real change across Algeria.",
    descAr: "قصص شباب ومؤسسات يصنعون تغييراً حقيقياً في الجزائر.",
    dateEn: "Coming soon", dateAr: "قريباً",
    dots: ["top-5 right-6", "top-9 left-7", "bottom-7 right-4", "bottom-4 left-10"],
    mediaItems: [],
  },
  {
    slug: "youth-hackathon",
    icon: ImageIcon,
    type: "photos",
    gradient: "linear-gradient(135deg, #059669 0%, #10B981 55%, #6EE7B7 100%)",
    iconBg: "#059669",
    coverImage: "/activity-youth-hackathon.jpg",
    badgeImage: "/activity-youth-hackathon.jpg",
    cardPosition: "center 20%",
    typeEn: "Photos", typeAr: "صور",
    titleEn: "Young Programmers", titleAr: "مبرمجونا الصغار",
    descEn: "Highlights from our youth innovation competition and team projects.",
    descAr: "أبرز لحظات مسابقتنا في الابتكار ومشاريع الفرق الشبابية.",
    dateEn: "Coming soon", dateAr: "قريباً",
    dots: ["top-4 left-8", "top-11 right-5", "bottom-6 left-3", "bottom-3 right-10"],
    mediaItems: [],
  },
  {
    slug: "expert-talks",
    icon: Video,
    type: "video",
    gradient: "linear-gradient(135deg, #2563EB 0%, #3B82F6 55%, #BFDBFE 100%)",
    iconBg: "#2563EB",
    coverImage: "/activity-expert-talks.jpg",
    badgeImage: "/activity-expert-talks.jpg",
    badgePosition: "85% 30%",
    cardPosition: "60% 55%",
    typeEn: "Video", typeAr: "فيديو",
    titleEn: "Expert Talks", titleAr: "محاضرات الخبراء",
    descEn: "Inspiring talks from technology leaders and innovators shaping our future.",
    descAr: "محادثات ملهمة من قادة التقنية والمبتكرين الذين يصنعون مستقبلنا.",
    dateEn: "Coming soon", dateAr: "قريباً",
    dots: ["top-6 left-5", "top-3 right-11", "bottom-4 left-11", "bottom-8 right-5"],
    mediaItems: [],
  },
];
