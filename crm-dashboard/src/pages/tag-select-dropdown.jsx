import { useState } from "react";
import SkillsTagsInput from "../formComponents/SkillsTagsInput";

export default function DemoPage() {
  const [skills, setSkills] = useState([]);

  const suggestions = [
    "React",
    "Node.js",
    "Python",
    "Go",
    "Rust",
    "Laravel",
    "PHP",
    "MySQL",
  ];

  return (
    <div className="p-6 max-w-xl">
      <SkillsTagsInput
        label="Skills"
        skills={skills}
        onChange={setSkills}
        suggestions={suggestions}
        placeholder="Select or type skills..."
      />

      {/* Debug */}
      {/* <pre className="mt-4 text-sm">{JSON.stringify(skills, null, 2)}</pre> */}
    </div>
  );
}