import React from "react";
import { getUnifiedProjects } from "@/actions/unified-projects";
import { onAuthenticateUser } from "@/actions/user";
import { DashboardHome } from "@/components/global/dashboard/DashboardHome";

const page = async () => {
  const allProjects = await getUnifiedProjects();
  const checkUser = await onAuthenticateUser();

  const projects = allProjects.data || [];
  const presentationCount = projects.filter(p => p.type === "PRESENTATION").length;
  const mobileDesignCount = projects.filter(p => p.type === "MOBILE_DESIGN").length;

  return (
    <div className="w-full flex flex-col gap-6 relative p-6">
      <DashboardHome
        projects={projects}
        userName={checkUser.user?.name || undefined}
        presentationCount={presentationCount}
        mobileDesignCount={mobileDesignCount}
      />
    </div>
  );
};

export default page;
