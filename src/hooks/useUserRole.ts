import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "admin" | "user" | null;

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (isMounted) {
            setRole(null);
            setIsLoading(false);
          }
          return;
        }

        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        if (isMounted) {
          if (error) {
            console.warn("useUserRole: fallback to 'user' due to error", error.message);
            setRole("user");
          } else {
            setRole((data?.role as UserRole) ?? "user");
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error("useUserRole error", err);
        if (isMounted) {
          setRole("user");
          setIsLoading(false);
        }
      }
    };

    fetchUserRole();

    return () => {
      isMounted = false;
    };
  }, []);

  return { role, isLoading, isAdmin: role === "admin" };
};
