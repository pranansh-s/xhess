import tw from 'tailwind-styled-components';

const ModalContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <ModalOverlay>
    <ModalBox className={className}>
      {children}
      <RopeSupport className="left-5" style={{ backgroundImage: 'url(/rope.png)' }} />
      <RopeSupport className="right-5" style={{ backgroundImage: 'url(/rope.png)' }} />
    </ModalBox>
  </ModalOverlay>
);

const ModalOverlay = tw.div`
  fixed
  left-0
  top-0
  z-[100]
  flex
  h-screen
  w-screen
  items-center
  justify-center
  text-center
  bg-black/60
  backdrop-blur-sm
`;

const ModalBox = tw.div`
  flex
  relative
  w-[90vw]
  max-w-[300px]
  flex-col
  gap-5
  rounded-xl
  border
  border-tertiary
  bg-primary
  p-10
  font-serif
`;

const RopeSupport = tw.div`
  absolute
  brightness-75
  z-10
  w-8
  top-[-100vh]
  bottom-[calc(100%-15px)]
  bg-repeat-y
  bg-contain
  rounded-b-full
  border-b-2
`;

export default ModalContainer;
