"use client";
import { useState } from "react";
import { Container } from "./Container";
import "../../styles/faq/background.css";
import "../../styles/faq.css";

const HacksFaq = [
  {
    question: "Who can participate?",
    answer: (
      <>
        Innovation Hacks is open to all the students from Arizona State
        University. Whether you&apos;re a complete beginner or an advanced
        hacker, you all are invited to join!
      </>
    ),
  },
  {
    question: "I've never been to a hackathon before. Should I participate?",
    answer: (
      <>
        Hackathons are where magic happens: new friendships, new teams, and new
        startups are born! It&apos;s an excellent opportunity to learn,
        collaborate, and create something amazing! We welcome participants of
        all skill levels!
      </>
    ),
  },
  {
    question: "Do you provide travel reimbursement?",
    answer: (
      <>
        No, Innovation Hacks 2026 does not offer travel reimbursement for
        participants. Participants are responsible for their travel expenses,
        and we recommend planning accordingly.
      </>
    ),
  },
  {
    question: "Do I need to know how to code?",
    answer: (
      <>
        No, you don&apos;t necessarily need to know how to code! A team
        comprises designers, presenters, coders and people who bring the vibes
        and motivation. So even if you don&apos;t know how to code, we believe
        you will bring other skills, and will be matched with a team!
      </>
    ),
  },
  {
    question: <>What will I get after attending Innovation Hacks 2026?</>,
    answer: (
      <>
        Innovation Hacks 2026 offers a dynamic platform for learning and
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
        The team size can range from a minimum of 2 participants to a maximum
        of 4 participants.
      </>
    ),
  },
  {
    question: <>Are team members from other colleges allowed? </>,
    answer: (
      <>
        No, Innovation Hacks 2026 welcomes participants from diverse
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
        Feel free to write to us at help@innovationhacks.dev or reach out on{" "}
        <a
          className="text-blue-400 underline"
          href="https://discord.gg/7Eq2zmvYgQ"
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
    <div className="mt-24 pb-24 w-full items-center justify-center flex flex-col gap-12 px-10 pt-0">
      <div className="text-center   flex flex-col">
        <div className="my-8 text-white text-xl sm:text-2xl md:text-4xl">
          <h2 className="text-2xl text-center font-bold md:text-3xl lg:text-4xl font-logo faq-title">
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
    <div className={`w-full ${full ? "" : "max-w-5xl"}`}>
      {HacksFaq.map((item, i) => (
        <div
          key={String(i)}
          className={`faq-item cursor-pointer text-lg${openIndex === i ? " faq-item--open" : ""}`}
        >
          {/* rome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
          <div
            className="flex w-full items-start justify-between py-4 text-left"
            onClick={() => handleToggle(i)}
          >
            <span className="font-medium w-[62vw] faq-question">
              {item.question}
            </span>
            <span className="ml-6 flex h-7 items-center faq-arrow">
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
            <div className="pr-12 duration-300 ease-in-out">
              <p className="pb-4 text-base faq-answer">
                {item.answer}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
