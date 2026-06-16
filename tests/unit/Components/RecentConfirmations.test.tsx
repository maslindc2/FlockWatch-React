import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import RecentConfirmations from "../../../src/Components/RecentConfirmations/RecentConfirmations";
import { SiteRecord } from "../../../src/Hooks/useSitesData";

describe("RecentConfirmations", () => {
    it("renders heading and legend with empty sites", () => {
        render(<RecentConfirmations sites={[]} />);
        expect(
            screen.getByText("Recent Confirmations")
        ).toBeInTheDocument();
        expect(screen.getByText("Red = active")).toBeInTheDocument();
        expect(
            screen.getByText("Amber = older active")
        ).toBeInTheDocument();
    });

    it("renders a single site entry", () => {
        const sites: SiteRecord[] = [
            {
                special_id: "SITE001",
                birds_affected: 5000,
                confirmed_diagnosis_date: "2025-01-15T00:00:00.000Z",
                county: "Elkhart",
                production_type: "Commercial Table Egg Layer",
                state: "Indiana",
                status: "active",
            },
        ];
        render(<RecentConfirmations sites={sites} />);
        expect(screen.getByText("Elkhart, Indiana")).toBeInTheDocument();
        expect(
            screen.getByText(/Commercial Table Egg Layer/)
        ).toBeInTheDocument();
        expect(screen.getByText(/5,000 birds/)).toBeInTheDocument();
        expect(screen.getByText("January 15, 2025")).toBeInTheDocument();
    });

    it("renders (N sites) when siteCount > 1", () => {
        const sites: SiteRecord[] = [
            {
                special_id: "SITE001",
                birds_affected: 5000,
                confirmed_diagnosis_date: "2025-01-15T00:00:00.000Z",
                county: "Elkhart",
                production_type: "Commercial Table Egg Layer",
                state: "Indiana",
                status: "active",
            },
            {
                special_id: "SITE002",
                birds_affected: 3000,
                confirmed_diagnosis_date: "2025-01-10T00:00:00.000Z",
                county: "Elkhart",
                production_type: "Backyard",
                state: "Indiana",
                status: "released",
            },
        ];
        render(<RecentConfirmations sites={sites} />);
        expect(screen.getByText("Elkhart, Indiana")).toBeInTheDocument();
        expect(screen.getByText(/\(2 sites\)/)).toBeInTheDocument();
        expect(screen.getByText(/8,000 birds/)).toBeInTheDocument();
    });

    it("shows active status dot when at least one site is active", () => {
        const sites: SiteRecord[] = [
            {
                special_id: "SITE001",
                birds_affected: 5000,
                confirmed_diagnosis_date: "2025-01-15T00:00:00.000Z",
                county: "Elkhart",
                production_type: "Commercial Table Egg Layer",
                state: "Indiana",
                status: "active",
            },
        ];
        const { container } = render(<RecentConfirmations sites={sites} />);
        const dot = container.querySelector(".dot-active");
        expect(dot).toBeInTheDocument();
    });

    it("shows older status dot when no sites are active", () => {
        const sites: SiteRecord[] = [
            {
                special_id: "SITE001",
                birds_affected: 5000,
                confirmed_diagnosis_date: "2025-01-15T00:00:00.000Z",
                county: "Elkhart",
                production_type: "Commercial Table Egg Layer",
                state: "Indiana",
                status: "released",
            },
        ];
        const { container } = render(<RecentConfirmations sites={sites} />);
        const dot = container.querySelector(".dot-older");
        expect(dot).toBeInTheDocument();
    });

    it("sorts entries by most recent date descending", () => {
        const sites: SiteRecord[] = [
            {
                special_id: "SITE002",
                birds_affected: 3000,
                confirmed_diagnosis_date: "2025-02-01T00:00:00.000Z",
                county: "Orange",
                production_type: "Commercial Table Egg Layer",
                state: "California",
                status: "active",
            },
            {
                special_id: "SITE001",
                birds_affected: 5000,
                confirmed_diagnosis_date: "2025-01-15T00:00:00.000Z",
                county: "Elkhart",
                production_type: "Commercial Table Egg Layer",
                state: "Indiana",
                status: "active",
            },
        ];
        const { container } = render(<RecentConfirmations sites={sites} />);
        const entries = container.querySelectorAll(".entry-main strong");
        expect(entries[0]).toHaveTextContent("Orange, California");
        expect(entries[1]).toHaveTextContent("Elkhart, Indiana");
    });
});
