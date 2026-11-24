// Preserve links to the first version of the experiment.
export default function GtaLoadingRedirect() {
  return null;
}

export function getServerSideProps() {
  return { redirect: { destination: "/gta-6", permanent: false } };
}
