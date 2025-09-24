import { formatAppDate } from "./timeUtils";

export default function formatDate(date: string, short: boolean = false) {
  return formatAppDate(date, short);
}
