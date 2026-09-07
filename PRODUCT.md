# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

VIT Chennai students applying to GDG on Campus departments, and authorised GDG VIT Chennai administrators reviewing those applications.

## Product Purpose

The portal makes the club recruitment flow clear and trustworthy: a student signs in with an official VIT email, chooses up to two departments, completes the shared and department-specific application, and submits it for review.

## Positioning

An official, focused recruitment experience for a Google Developer Groups campus community rather than a generic form or event landing page.

## Operating Context

Applicants use the portal primarily on mobile or laptop during a short recruitment window. Administrators review, shortlist, export, and contact applicants from a protected dashboard.

## Capabilities and Constraints

- Next.js application with Better Auth and server-only Firestore access.
- Official VIT email restriction, a maximum of two applications per applicant, and admin-only applicant management must remain intact.
- Existing routing, form fields, authenticated flows, social links, and recruitment-window enforcement must remain functional.

## Brand Commitments

- GDG on Campus / Google Developer Groups, VIT Chennai.
- Use the existing Google-style four-colour mark and official social links.
- The user requested a high-quality, mature, Google Labs-inspired experience with intentional motion and no purple-gradient, ambient-blob, glassmorphism, or generic AI visual language.

## Evidence on Hand

- Existing GDG logo component: `components/GDGLogo.jsx`.
- Twelve department names, descriptions, and colours: `constants/index.js`.
- Current application, administration, and social-link flows in the existing codebase.
- No official photography, event imagery, testimonials, or approved metrics were supplied; none will be fabricated.

## Product Principles

- Make the path to applying immediately understandable.
- Make an official student-club experience feel credible, calm, and contemporary.
- Let typography, spacing, and content carry the hierarchy.
- Use Google colour as a controlled signal, not decoration.
- Keep form and dashboard tasks fast and legible.

## Accessibility & Inclusion

- Responsive keyboard-accessible web experience with visible focus states and reduced-motion support.
- Maintain readable contrast and clear labels/errors throughout the recruitment flow.
