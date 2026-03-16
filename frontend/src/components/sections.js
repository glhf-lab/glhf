import { useRouter } from "next/router"
import Hero from "src/components/sections/hero"
import LargeVideo from "src/components/sections/large-video"
import FeatureColumnsGroup from "src/components/sections/feature-columns-group"
import FeatureRowsGroup from "src/components/sections/feature-rows-group"
import BottomActions from "src/components/sections/bottom-actions"
import TestimonialsGroup from "src/components/sections/testimonials-group"
import RichText from "./sections/rich-text"
import Pricing from "./sections/pricing"
import LeadForm from "./sections/lead-form"
import Team from "./sections/team"
import Logos from "./sections/logos"

// Map Strapi sections to section components
const sectionComponents = {
  ComponentSectionsHero: Hero,
  ComponentSectionsLargeVideo: LargeVideo,
  ComponentSectionsFeatureColumnsGroup: FeatureColumnsGroup,
  ComponentSectionsFeatureRowsGroup: FeatureRowsGroup,
  ComponentSectionsBottomActions: BottomActions,
  ComponentSectionsTestimonialsGroup: TestimonialsGroup,
  ComponentSectionsRichText: RichText,
  ComponentSectionsPricing: Pricing,
  ComponentSectionsLeadForm: LeadForm,
  ComponentSectionsTeam: Team,
  ComponentSectionsLogos: Logos,
}

// Display a section individually
const Section = ({ sectionData }) => {
  // Prepare the component
  const SectionComponent = sectionComponents[sectionData.__typename]

  if (!SectionComponent) {
    return null
  }

  // Display the section
  return <SectionComponent data={sectionData} />
}

const PreviewModeBanner = () => {
  const router = useRouter()
  const exitURL = `/api/exit-preview?redirect=${encodeURIComponent(
    router.asPath
  )}`

  return (
    <div className="bg-red-600 py-4 font-semibold uppercase tracking-wide text-red-100">
      <div className="container">
        Preview mode is on.{" "}
        <a
          className="underline"
          href={`/api/exit-preview?redirect=${router.asPath}`}
        >
          Turn off
        </a>
      </div>
    </div>
  )
}

// Display the list of sections
const Sections = ({ sections, preview }) => {
  return (
    <div className="flex flex-col">
      {/* Show a banner if preview mode is on */}
      {preview && <PreviewModeBanner />}
      {/* Show the actual sections */}
      {sections.map((section) => (
        <Section
          sectionData={section}
          key={`${section.__typename}${section.id}`}
        />
      ))}
    </div>
  )
}

export default Sections
