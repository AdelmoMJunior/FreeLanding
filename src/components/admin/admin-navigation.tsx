"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { href: "/admin", label: "Visão geral" },
  { href: "/admin/settings", label: "Configurações" },
  {
    href: "/admin/modules",
    label: "Módulos",
    children: [
      { href: "/admin/modules", label: "Módulos do sistema" },
      { href: "/admin/benefits", label: "Benefícios" },
      { href: "/admin/faqs", label: "FAQ" },
    ],
  },
  { href: "/admin/leads", label: "Leads" },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegação administrativa">
      <ul className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1">
        {navigationItems.map((item) => {
          const children = "children" in item ? item.children : null;
          const isActive = children
            ? children.some((child) => isActivePath(pathname, child.href))
            : isActivePath(pathname, item.href);

          return (
            <li key={item.href}>
              <div className="group">
                <Link
                  href={item.href}
                  aria-current={!children && isActive ? "page" : undefined}
                  aria-haspopup={children ? "menu" : undefined}
                  className={`flex min-h-12 items-center justify-between gap-2 rounded-2xl px-4 py-3 text-sm font-bold ring-1 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700 ${
                    isActive
                      ? "bg-emerald-50 text-slate-950 ring-emerald-200 shadow-[0_14px_30px_rgba(15,23,42,0.10)]"
                      : "bg-slate-50 text-slate-700 ring-transparent hover:bg-white hover:text-slate-950"
                  }`}
                >
                  <span className="min-w-0 truncate">{item.label}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    {isActive ? (
                      <span className="rounded-full bg-emerald-300 px-2 py-0.5 text-[0.65rem] font-black uppercase tracking-[0.14em] text-slate-950">
                        ativo
                      </span>
                    ) : null}
                    {children ? (
                      <span aria-hidden="true" className="text-xs text-slate-500 transition group-hover:rotate-180 group-focus-within:rotate-180">
                        ▾
                      </span>
                    ) : null}
                  </span>
                </Link>
                {children ? (
                  <ul
                    className={`grid overflow-hidden pl-3 transition-[max-height,opacity,margin] duration-200 ${
                      isActive
                        ? "mt-2 max-h-64 gap-1 opacity-100"
                        : "max-h-0 gap-0 opacity-0 group-hover:mt-2 group-hover:max-h-64 group-hover:gap-1 group-hover:opacity-100 group-focus-within:mt-2 group-focus-within:max-h-64 group-focus-within:gap-1 group-focus-within:opacity-100"
                    }`}
                    aria-label="Submenu de módulos"
                  >
                    {children.map((child) => {
                      const isChildActive = isActivePath(pathname, child.href);

                      return (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            aria-current={isChildActive ? "page" : undefined}
                            className={`flex min-h-10 items-center rounded-xl px-4 py-2 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700 ${
                              isChildActive
                                ? "bg-white text-emerald-900 ring-1 ring-emerald-200"
                                : "text-slate-600 hover:bg-white hover:text-slate-950"
                            }`}
                          >
                            {child.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
