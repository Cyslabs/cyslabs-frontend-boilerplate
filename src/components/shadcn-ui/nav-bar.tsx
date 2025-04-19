"use client";
import useAuth from "@/services/auth/use-auth";
import useAuthActions from "@/services/auth/use-auth-actions";
import { useTranslation } from "@/services/i18n/client";
// eslint-disable-next-line no-restricted-imports
import Link from "next/link";
import { RoleEnum } from "@/services/api/types/role";
import { IS_SIGN_UP_ENABLED } from "@/services/auth/config";
import { Menu } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn-ui/avatar";
import { Button } from "@/components/shadcn-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from "@/components/shadcn-ui/sheet";
import { Separator } from "@/components/shadcn-ui/separator";
import ThemeSwitchButton from "@/components/shadcn-ui/theme-switch";

function NewNavBar() {
  const { t } = useTranslation("common");
  const { user, isLoaded } = useAuth();
  const { logOut } = useAuthActions();

  // Get initials for avatar fallback
  const getInitials = () => {
    if (!user?.firstName && !user?.lastName) return "U";
    return `${user?.firstName?.charAt(0) || ""}${user?.lastName?.charAt(0) || ""}`;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center mx-auto">
        {/* Logo - visible on all screens */}
        <div className="mx-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-mono text-xl font-bold tracking-wider">
              {t("common:app-name")}
            </span>
          </Link>
        </div>

        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <SheetHeader>
              <SheetTitle>
                <Link href="/" className="flex items-center">
                  <span className="font-mono text-xl font-bold tracking-wider">
                    {t("common:app-name")}
                  </span>
                </Link>
              </SheetTitle>
            </SheetHeader>
            <Separator className="my-4" />
            <div className="flex flex-col space-y-3 py-4">
              <SheetClose asChild>
                <Link
                  href="/"
                  className="flex items-center px-2 py-1 text-foreground"
                >
                  {t("common:navigation.home")}
                </Link>
              </SheetClose>

              {!!user?.role &&
                [RoleEnum.ADMIN].includes(Number(user?.role?.id)) && (
                  <>
                    <SheetClose asChild>
                      <Link
                        href="/admin-panel/users"
                        className="flex items-center px-2 py-1 text-foreground"
                      >
                        {t("common:navigation.users")}
                      </Link>
                    </SheetClose>
                    {/* mobile-menu-items */}
                  </>
                )}

              {isLoaded && !user && (
                <>
                  <Separator className="my-2" />
                  <SheetClose asChild>
                    <Link
                      href="/sign-in"
                      className="flex items-center px-2 py-1 text-foreground"
                    >
                      {t("common:navigation.signIn")}
                    </Link>
                  </SheetClose>
                  {IS_SIGN_UP_ENABLED && (
                    <SheetClose asChild>
                      <Link
                        href="/sign-up"
                        className="flex items-center px-2 py-1 text-foreground"
                      >
                        {t("common:navigation.signUp")}
                      </Link>
                    </SheetClose>
                  )}
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Mobile logo */}
        <div className="md:hidden">
          <Link href="/" className="flex items-center">
            <span className="font-mono text-xl font-bold tracking-wider">
              {t("common:app-name")}
            </span>
          </Link>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden flex-1 items-center space-x-4 md:flex">
          <Link
            href="/"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            {t("common:navigation.home")}
          </Link>

          {!!user?.role &&
            [RoleEnum.ADMIN].includes(Number(user?.role?.id)) && (
              <>
                <Link
                  href="/admin-panel/users"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  {t("common:navigation.users")}
                </Link>
                {/* desktop-menu-items */}
              </>
            )}
        </nav>

        {/* Theme switcher */}
        <div className="flex items-center">
          <ThemeSwitchButton />
        </div>

        {/* User menu or auth buttons */}
        <div className="ml-4 flex items-center">
          {!isLoaded ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-8 w-8 rounded-full"
                  data-testid="profile-menu-item"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.photo?.path || "/placeholder.svg"}
                      alt={`${user?.firstName} ${user?.lastName}`}
                    />
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild data-testid="user-profile">
                  <Link href="/profile">{t("common:navigation.profile")}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logOut}
                  data-testid="logout-menu-item"
                >
                  {t("common:navigation.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden space-x-1 md:flex">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/sign-in">{t("common:navigation.signIn")}</Link>
              </Button>
              {IS_SIGN_UP_ENABLED && (
                <Button variant="default" size="sm" asChild>
                  <Link href="/sign-up">{t("common:navigation.signUp")}</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default NewNavBar;
