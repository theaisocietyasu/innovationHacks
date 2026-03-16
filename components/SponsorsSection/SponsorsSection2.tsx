import React, { createFactory } from "react";
import "./sponsorTilt.css";
import "../../styles/sponsors/background.css";

type Sponsor = {
  src: string;
  alt: string;
  link?: string;
  imageDimension?: string;
  scale?: string;
  style?: React.CSSProperties;
};

type SponsorsGroup = {
  event?: Sponsor[];
  gold?: Sponsor[];
  general?: Sponsor[];
  silver?: Sponsor[];
  sponsors?: Sponsor[];
  bronze?: Sponsor[];
  platinum?: Sponsor[];
};

type CategorySize = {
  imgSize: string;
  scale?: string;
};

export default function SponsorsSection2() {
  const handleClick = (link: string) => {
    window.open(link, "_blank");
  };
  const sponsors: SponsorsGroup = {
    //emerald: [{ src: "/sponsors_logos/Devfolio_Logo-White.svg", alt: "LOGO" }],
    //   platinum: [
    //     {
    //     src: "/sponsors_logos/amazon.svg",
    //     alt: "AMAZON LOGO",
    //     link: "https://amazon.com",
    //     class: "scale-[0.6] md:scale-[0.6]",
    //   },
    //   {
    //     src: "/sponsors_logos/statefarmm.png",
    //     alt: "STATEFARM LOGO",
    //     link: "https://www.statefarm.com",
    //     class: "scale-[0.5] md:scale-[0.5]",
    //   },
    //   {
    //     src: "/sponsors_logos/OH.png",
    //     alt: "OPPORTUNITY HACKS LOGO ",
    //     link: "https://www.ohack.org",
    //     class: "scale-[0.6] md:scale-[0.6]",
    //   },
    //   {
    //     src: "/sponsors_logos/viasat.svg",
    //     alt: "VIASAT LOGO",
    //     link: "https://www.viasat.com",
    //     class: "scale-[1.3] md:scale-[2.4]",
    //   },
    //   {
    //     src: "/sponsors_logos/sn.png",
    //     alt: "SERVICENOW LOGO",
    //     link: "https://www.servicenow.com",
    //     class: "scale-[0.75] md:scale-[0.85]",
    //   },
    // ],
    gold: [
      {
        src: "/sponsors_logos/google.png",
        alt: "Google LOGO",
        link: "https://google.com",
      },
      {
        src: "/sponsors_logos/amazon.svg",
        alt: "Amazon LOGO",
        link: "https://aws.amazon.com",
        style: { display: "block", margin: "0 auto" },
      },
      {
        src: "/sponsors_logos/statefarmm.png",
        alt: "State Farm LOGO",
        link: "https://statefarm.com",
      },
    ],
    event: [
      // {
      //   src : "/sponsors_logos/Quant.png",
      //   alt: "QUANT QUESTIONS LOGO",
      //   link: "https://quantquestions.io",
      // },
      // {
      //   src : "/sponsors_logos/sunhacks.png",
      //   alt: "SUNHACKS LOGO",
      //   link: "https://sunhacks.io",
      // },
      // {
      //   src : "/sponsors_logos/celsius.svg",
      //   alt: "CELSIUS LOGO",
      //   link: "https://www.celsius.com",
      // },
      {
        src: "/sponsors_logos/mlh.svg",
        alt: "MLH LOGO",
        link: "https://mlh.io",
      },
      {
        src: "/sponsors_logos/pure_buttons.svg",
        alt: "PureButtons LOGO",
        link: "https://purebuttons.com",
        style: { filter: "invert(1)" },
      },
      {
        src: "/assets/images/AI_Society.png",
        alt: "AI SOCIETY LOGO",
        link: "https://www.ais-asu.com/",
        style: { width: "80px", height: "80px" },
      },
      {
        src: "/assets/images/gdsc.svg",
        alt: "GDG ASU Logo",
        link: "https://www.asudsc.com/",
        style: { width: "80px", height: "80px" },
      },
      {
        src: "/assets/images/soda.png",
        alt: "SoDA LOGO",
        link: "https://thesoda.io/",
      },
      /*
     {
       src : "/sponsors_logos/es.png",
       alt: "ETHICAL SPECTACLE LOGO",
       link: "https://ethicalspectacle.org",
       class: "scale-[0.7] md:scale-[0.5]",
     }, */
    ],
    /*silver: [],*/ // Use this commented section if there is a category for silver sponsors
    /*bronze: [],*/ // Use this commented section if there is a category for bronze sponsors
  };

  const categorySizes: { [key: string]: CategorySize } = {
    platinum: {
      imgSize:
        "h-[130px] w-[300px]  md:px-8 px-4 py-1 md:h-[200px] md:w-[600px] ",
    },

    emerald: { imgSize: "w-48 h-16 sm:h-full sm:w-full" },
    diamond: { imgSize: "w-48 h-16 sm:h-full sm:w-full" },
    gold: {
      imgSize: "h-[60px] w-[250px] px-2 py-1 md:h-[105px] md:w-[420px]",
    },
    sponsors: {
      imgSize: "h-[90px] w-[250px] px-2 py-1 md:h-[120px] md:w-[500px]",
    },
    event: {
      imgSize: "h-[60px] w-[250px] px-2 py-1 md:h-[105px] md:w-[420px]",
    },
    silver: {
      imgSize: "h-[60px] w-[200px] px-2 py-1 md:h-[120px] md:w-[300px]",
    },
    bronze: {
      imgSize: "h-[60px] w-[200px] px-2 py-1 md:h-[120px] md:w-[300px]",
    },
  };

  return (
    <div className="pt-24 pb-24 sm:mt-24">
      {/* <h1 className="my-10 text-center text-white text-3xl sm:text-4xl md:text-4xl xl:text-5xl font-logo sponsorContainer1">
        Sponsors
      </h1> */}

      {Object.entries(sponsors).map(([category, sponsorList]) => (
        <div key={category} className={`${category}SponsorContainer`}>
          <h2
            className={`text-center m-auto md:my-20 my-10 text-white text-lg md:text-xl xl:text-2xl md:w-1/6 w-1/2 font-semibold px-1 py-2 title-${category.toLowerCase()} rounded-md`}
          >
            {category === "gold"
              ? "Sponsors"
              : category == "event"
              ? "Partners"
              : category.charAt(0).toUpperCase() + category.slice(1) + " "}{" "}
          </h2>

          <div className="flex flex-wrap justify-center md:px-20">
            {sponsorList.map((sponsor, index) => (
              <a
                key={index}
                href={sponsor.link ? sponsor.link : ""}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div
                  className={`m-4 glassy-div bg-cover bg-center flex items-center justify-center no-repeat rounded-2xl md:p-5 p-1 overflow-hidden hover-effect-${category} ${
                    sponsor.link ? "cursor-pointer" : "cursor-default"
                  } ${categorySizes[category]?.imgSize}`}
                  onClick={
                    sponsor.link
                      ? () => {
                          handleClick(sponsor.link!);
                        }
                      : () => {}
                  }
                >
                  <img
                    alt=""
                    src={`${sponsor.src}`}
                    className="w-full h-full object-contain p-3"
                    style={sponsor.style}
                  />
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
