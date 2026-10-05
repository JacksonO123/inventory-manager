import Link from 'next/link';

export default function AuthError() {
  return (
    <div>
      Whoops, looks like something went wrong. <Link href="/">Try again</Link>
    </div>
  );
}
