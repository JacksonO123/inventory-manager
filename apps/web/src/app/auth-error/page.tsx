import Link from 'next/link';
import { ErrorCardPage } from '../../components/ErrorCardPage';

export default function AuthError() {
  return (
    <ErrorCardPage title="Auth Error">
      Whoops, looks like something went wrong. <Link href="/">Try again</Link>
    </ErrorCardPage>
  );
}
