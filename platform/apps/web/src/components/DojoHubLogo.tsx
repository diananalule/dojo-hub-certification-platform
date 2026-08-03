import Image from 'next/image';

const ASPECT_RATIO = 828 / 754;

interface DojoHubLogoProps {
  className?: string;
  size?: number;
}

export default function DojoHubLogo({ className = '', size = 48 }: DojoHubLogoProps) {
  return (
    <Image
      src="/dojohub-logo.png"
      alt="Dojo Hub"
      width={Math.round(size * ASPECT_RATIO)}
      height={size}
      className={className}
      priority
    />
  );
}
