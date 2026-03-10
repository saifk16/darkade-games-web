import Image from "next/image";
import { Link } from "@/components/ui/Link"
import {Select, SelectItem} from '@/components/ui/Select';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Select label="Favorite animal">
          <SelectItem>Aardvark</SelectItem>
          <SelectItem>Cat</SelectItem>
          <SelectItem>Dog</SelectItem>
          <SelectItem>Kangaroo</SelectItem>
          <SelectItem>Panda</SelectItem>
          <SelectItem>Snake</SelectItem>
        </Select>
      </main>

      <Link
          href="/signup"
          className="inline-flex h-10 items-center justify-center rounded-xl px-5 text-sm font-medium no-underline"
      >
        Get started
      </Link>
    </div>
  );
}
