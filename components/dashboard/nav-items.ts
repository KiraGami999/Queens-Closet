import { Images, LayoutGrid, Shirt, Users, Wand2 } from "lucide-react";

export const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutGrid },
  { title: "Closet", url: "/dashboard/garments", icon: Shirt },
  { title: "Clients", url: "/dashboard/clients", icon: Users },
  { title: "Try-On Studio", url: "/dashboard/generate", icon: Wand2 },
  { title: "Creations", url: "/dashboard/looks", icon: Images },
] as const;
