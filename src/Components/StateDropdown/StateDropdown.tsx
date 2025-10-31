const states = [
    {
        name: "Alaska",
        stateAbbreviation: "AK",
    },
    {
        name: "Alabama",
        stateAbbreviation: "AL",
    },
    {
        name: "Arkansas",
        stateAbbreviation: "AR",
    },
    {
        name: "Arizona",
        stateAbbreviation: "AZ",
    },
    {
        name: "California",
        stateAbbreviation: "CA",
    },
    {
        name: "Colorado",
        stateAbbreviation: "CO",
    },
    {
        name: "Connecticut",
        stateAbbreviation: "CT",
    },
    {
        name: "Delaware",
        stateAbbreviation: "DE",
    },
    {
        name: "Florida",
        stateAbbreviation: "FL",
    },
    {
        name: "Georgia",
        stateAbbreviation: "GA",
    },
    {
        name: "Hawaii",
        stateAbbreviation: "HI",
    },
    {
        name: "Iowa",
        stateAbbreviation: "IA",
    },
    {
        name: "Idaho",
        stateAbbreviation: "ID",
    },
    {
        name: "Illinois",
        stateAbbreviation: "IL",
    },
    {
        name: "Indiana",
        stateAbbreviation: "IN",
    },
    {
        name: "Kansas",
        stateAbbreviation: "KS",
    },
    {
        name: "Kentucky",
        stateAbbreviation: "KY",
    },
    {
        name: "Louisiana",
        stateAbbreviation: "LA",
    },
    {
        name: "Massachusetts",
        stateAbbreviation: "MA",
    },
    {
        name: "Maryland",
        stateAbbreviation: "MD",
    },
    {
        name: "Maine",
        stateAbbreviation: "ME",
    },
    {
        name: "Michigan",
        stateAbbreviation: "MI",
    },
    {
        name: "Minnesota",
        stateAbbreviation: "MN",
    },
    {
        name: "Missouri",
        stateAbbreviation: "MO",
    },
    {
        name: "Mississippi",
        stateAbbreviation: "MS",
    },
    {
        name: "Montana",
        stateAbbreviation: "MT",
    },
    {
        name: "North Carolina",
        stateAbbreviation: "NC",
    },
    {
        name: "North Dakota",
        stateAbbreviation: "ND",
    },
    {
        name: "Nebraska",
        stateAbbreviation: "NE",
    },
    {
        name: "New Hampshire",
        stateAbbreviation: "NH",
    },
    {
        name: "New Jersey",
        stateAbbreviation: "NJ",
    },
    {
        name: "New Mexico",
        stateAbbreviation: "NM",
    },
    {
        name: "Nevada",
        stateAbbreviation: "NV",
    },
    {
        name: "New York",
        stateAbbreviation: "NY",
    },
    {
        name: "Ohio",
        stateAbbreviation: "OH",
    },
    {
        name: "Oklahoma",
        stateAbbreviation: "OK",
    },
    {
        name: "Oregon",
        stateAbbreviation: "OR",
    },
    {
        name: "Pennsylvania",
        stateAbbreviation: "PA",
    },
    {
        name: "Puerto Rico",
        stateAbbreviation: "PR",
    },
    {
        name: "Rhode Island",
        stateAbbreviation: "RI",
    },
    {
        name: "South Carolina",
        stateAbbreviation: "SC",
    },
    {
        name: "South Dakota",
        stateAbbreviation: "SD",
    },
    {
        name: "Tennessee",
        stateAbbreviation: "TN",
    },
    {
        name: "Texas",
        stateAbbreviation: "TX",
    },
    {
        name: "Utah",
        stateAbbreviation: "UT",
    },
    {
        name: "Virginia",
        stateAbbreviation: "VA",
    },
    {
        name: "Vermont",
        stateAbbreviation: "VT",
    },
    {
        name: "Washington",
        stateAbbreviation: "WA",
    },
    {
        name: "Wisconsin",
        stateAbbreviation: "WI",
    },
    {
        name: "West Virginia",
        stateAbbreviation: "WV",
    },
    {
        name: "Wyoming",
        stateAbbreviation: "WY",
    },
];

export default function StateDropdown({ onSelect }) {
    return (
        <>
            <h3 id="select-state-heading">
                Select a state on the map or from the dropdown to see its latest
                stats.
            </h3>
            <label htmlFor="state-select" className="visually-hidden">Select a State</label>
            <select onChange={(e) => onSelect(e.target.value)} id="state-select" aria-labelledby="select-state-heading">
                <option value="">Select a State</option>
                {states.map((state) => (
                    <option
                        key={state.stateAbbreviation}
                        value={state.stateAbbreviation}
                    >
                        {state.name}
                    </option>
                ))}
            </select>
        </>
    );
}
