import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import StateDropdown from "../../../src/Components/StateDropdown/StateDropdown";

describe("StateDropdown", () => {
    it("renders heading and select element", () => {
        render(<StateDropdown onSelect={vi.fn()} />);
        expect(
            screen.getByText("Select a state to view outbreak details")
        ).toBeInTheDocument();
        const select = screen.getByRole("combobox", {
            name: "Select a state to view outbreak details",
        });
        expect(select).toBeInTheDocument();
    });

    it("renders 50 state options plus disabled placeholder", () => {
        render(<StateDropdown onSelect={vi.fn()} />);
        const options = screen.getAllByRole("option");
        expect(options).toHaveLength(51);
        expect(options[0]).toHaveValue("");
        expect(options[0]).toBeDisabled();
        expect(options[0]).toHaveTextContent("— Select a state —");
    });

    it("calls onSelect with abbreviation when a state is chosen", () => {
        const onSelect = vi.fn();
        render(<StateDropdown onSelect={onSelect} />);
        const select = screen.getByRole("combobox");
        fireEvent.change(select, { target: { value: "CA" } });
        expect(onSelect).toHaveBeenCalledWith("CA");
    });

    it("resets select value after selection", () => {
        const onSelect = vi.fn();
        render(<StateDropdown onSelect={onSelect} />);
        const select = screen.getByRole("combobox") as HTMLSelectElement;
        fireEvent.change(select, { target: { value: "TX" } });
        expect(select.value).toBe("");
    });

    it("does not call onSelect when disabled placeholder is chosen", () => {
        const onSelect = vi.fn();
        render(<StateDropdown onSelect={onSelect} />);
        const select = screen.getByRole("combobox");
        fireEvent.change(select, { target: { value: "" } });
        expect(onSelect).not.toHaveBeenCalled();
    });
});
