"use client";
import { useState } from "react";
import { Container } from "./Container";
import "../../styles/faq/background.css";

const HacksFaq = [
  {
    question: "Who can participate?",
    answer: (
      <>
        Innovation Hacks 2025 is open to a diverse range of participants,
        including students, developers, designers, and tech enthusiasts.
        However, participants must be part of Arizona State University. Whether
        you're a beginner or an experienced coder, there's a place for you here!
      </>
    ),
  },
  {
    question: "I've never been to a hackathon before. Should I participate?",
    answer: (
      <>
        Congratulations on considering your first hackathon! Innovation Hacks
        2025 is a perfect starting point. We welcome participants of all skill
        levels and provide mentorship throughout the event. It's an excellent
        opportunity to learn, collaborate, and create something amazing!
      </>
    ),
  },
  {
    question: "Do you provide travel reimbursement?",
    answer: (
      <>
        No, Innovation Hacks 2025 does not offer travel reimbursement for
        participants. Participants are responsible for their travel expenses,
        and we recommend planning accordingly.
      </>
    ),
  },
  {
    question: "Do I need to know how to code?",
    answer: (
      <>
        Yes, Innovation Hacks 2025 welcomes participants from diverse
        backgrounds, including those new to coding. We encourage learning and
        provide resources and mentorship to help you succeed!
      </>
    ),
  },
  {
    question: <>What will I get after attending Innovation Hacks 2025?</>,
    answer: (
      <>
        Innovation Hacks 2025 offers a dynamic platform for learning and
        collaboration. You'll gain hands-on experience, network with industry
        professionals, receive mentorship, and have the chance to win exciting
        prizes. Plus, you'll create lasting connections in the tech community.
      </>
    ),
  },
  {
    question: <>What should be the team size? </>,
    answer: (
      <>
        The team size can range from a minimum of 2 participant to a maximum of
        4 participants. 🤝
      </>
    ),
  },
  {
    question: <>Are team members from other colleges allowed? </>,
    answer: (
      <>
        No, Innovation Hacks 2025 welcomes participants from diverse
        backgrounds, only from Arizona State University.
      </>
    ),
  },
  {
    question: <>What if I do not have a team? </>,
    answer: (
      <>
        We have a great community on Discord. Reach out to other innovators,
        collaborate, communicate, and make things possible! 🤝
      </>
    ),
  },
  {
    question: <>Have more questions? </>,
    answer: (
      <>
        Feel free to write to us at help@innovationhacks.dev or create a
        ticket🎫 on{" "}
        <a
          className="text-blue-400 underline"
          href="https://discord.gg/the-software-developers-association-762811961238618122"
          target="_blank"
        >
          discord
        </a>
      </>
    ),
  },
];

export default function FAQ() {
  return (
    <div className="mt-20 w-full items-center justify-center flex flex-col gap-12  p-10 ">
      <div className="text-center   flex flex-col">
        <div className="my-8 text-white text-xl sm:text-2xl md:text-4xl">
          <h2 className="text-2xl text-center font-bold text-white dark:text-white md:text-3xl lg:text-4xl font-logo">
            Frequently Asked Questions
          </h2>
        </div>
      </div>
      <div className="flex w-full faqContainer1  flex-col items-center justify-center">
        <Disclosures />
      </div>
    </div>
  );
}

export function Disclosures({ full = false }) {
  const [openIndex, setOpenIndex] = useState(0);

  const handleToggle = (index: any) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <div className={`glassy-div divide-y divide-zinc-200 border-y border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800`}>
      {HacksFaq.map((item, i) => (
        <div
          key={String(i)}
          className={`mx-auto  cursor-pointer text-lg ${
            full ? "" : "max-w-5xl"
          }`}
        >
          {/* rome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
          <div
            className="flex w-full items-start justify-between py-6 text-left text-gray-400"
            onClick={() => handleToggle(i)}
          >
            <span className="font-medium w-[62vw] text-white dark:text-white">
              {item.question}
            </span>
            <span className="ml-6 flex h-7 items-center">
              <svg
                className={`arrow-down h-6 w-6 transform duration-300 ${
                  openIndex === i ? "rotate-180" : "rotate-0"
                }`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </span>
          </div>
          {openIndex === i && (
            <div
              className={`pr-12 duration-300 ease-in-out ${
                openIndex === i ? "" : "hidden"
              }`}
            >
              <p className="pb-6 text-base text-white dark:text-gray-400">
                {item.answer}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
