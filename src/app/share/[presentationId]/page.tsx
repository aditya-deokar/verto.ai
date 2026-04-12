import { getSharedProjectById } from "@/actions/project-share";
import PresentationViewer from "@/components/presentation/PresentationViewer";
import { themes } from "@/lib/constants";
import { Slide } from "@/lib/types";
import { notFound } from "next/navigation";

function parseSlides(slides: unknown): Slide[] {
  if (!Array.isArray(slides)) {
    return [];
  }

  return JSON.parse(JSON.stringify(slides)) as Slide[];
}

export default async function SharedPresentationPage({
  params,
}: {
  params: Promise<{ presentationId: string }>;
}) {
  const { presentationId } = await params;
  const response = await getSharedProjectById(presentationId);

  if (response.status !== 200 || !response.data) {
    notFound();
  }

  const project = response.data;
  const theme = themes.find((item) => item.name === project.themeName) || themes[0];

  return (
    <PresentationViewer
      title={project.title}
      slides={parseSlides(project.slides)}
      theme={theme}
      exitHref="/"
      exitLabel="Close"
      viewerMode="share"
    />
  );
}
