type SectionCrumbProps = {
  label: string;
  meta: string;
};

export default function SectionCrumb({ label, meta }: SectionCrumbProps) {
  return (
    <div className="section-crumb">
      <h2 className="section-crumb__label">{label}</h2>
      <span className="section-crumb__meta">{meta}</span>
    </div>
  );
}
