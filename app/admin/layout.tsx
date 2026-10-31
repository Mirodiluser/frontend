import type { Metadata } from "next";

// A user's private admin dashboard must never appear in search results.
export const metadata: Metadata = {
  title: "Admin panel",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
