import portfolioData from "@/data/portfolioData.json";

export const DEFAULT_PROJECTS = portfolioData.projects || [];
export const DEFAULT_ACHIEVEMENTS = portfolioData.achievements || [];
export const DEFAULT_EXPERIENCES = portfolioData.experiences || [];
export const DEFAULT_EDUCATIONS = portfolioData.educations || [];
export const DEFAULT_CERTIFICATIONS = portfolioData.certifications || [];
export const DEFAULT_SKILLS = portfolioData.skills || [];
export const DEFAULT_SETTINGS = portfolioData.settings || {
  id: 1,
  name: "Harshit Bhuju",
  firstName: "HARSHIT",
  lastName: "BHUJU",
  role: "Frontend Developer",
  secondaryRole: "Competitive Tech Builder",
  tagline: "I build clean, scalable and thoughtful digital experiences with modern web technologies.",
  aboutStatement: "I build interfaces where design and engineering meet.",
  aboutBody: "Frontend developer focused on crafting performant, accessible interfaces with modern React and Next.js. I care equally about visual quality, interaction design, and clean engineering — from thoughtful component architecture to efficient data fetching and optimistic UI updates.",
  aboutFocus: [
    "Frontend Development",
    "UI/UX & Accessibility",
    "Modern React / Next.js",
    "API Integration",
    "Competitive Project Building",
  ],
  email: "harshitbhuju123@gmail.com",
  phone: "+977 9869372811",
  whatsapp: "9779869372811",
  location: "Banepa-5, Kavrepalanchowk, Nepal",
  linkedin: "https://www.linkedin.com/in/harshit-bhuju/",
  github: "https://github.com/Harshit-Bhuju",
  facebook: "https://www.facebook.com/harshit.bhuju.2025",
  instagram: "https://www.instagram.com/bhujuharshit_5/",
  resumePath: "/resume.pdf",
  profileImage: "/profile.jpg",
};
