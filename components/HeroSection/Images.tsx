import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

function Images({ ease }: any) {
  const box1Controls = useAnimation();
  const box2Controls = useAnimation();
  const box3Controls = useAnimation();

  useEffect(() => {
    const animateImages = async () => {
      await Promise.all([
        box1Controls.start({
          opacity: 1,
          y: 0,
          x: 0,
          transition: { duration: 1.5, ease: ease },
        }),
        box2Controls.start({
          opacity: 1,
          y: 0,
          x: 0,
          transition: { duration: 1.3, ease: ease },
        }),
        box3Controls.start({
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: ease },
        }),
      ]);

      await Promise.all([
        box1Controls.start({
          scale: 1.6,
          transition: { duration: 1, ease: ease },
        }),
        box2Controls.start({
          scale: 1.6,
          transition: { duration: 1, ease: ease },
        }),
        box3Controls.start({
          scale: 1.6,
          transition: { duration: 1, ease: ease },
        }),
      ]);
    };

    animateImages();
  }, [box1Controls, box2Controls, box3Controls, ease]);

  return (
    <div className="relative flex flex-col">
      <div className="flex">
        <motion.div
          className="w-40 h-24  mr-12"
          initial={{ opacity: 0, y: -500, x: -300 }}
          animate={box1Controls}
        >
          <img
            src="/assets/images/gdsc.svg"
            alt="Alt"
            className="bg-white border-2 border-solid border-red-500 rounded w-40 h-24"
          />
        </motion.div>
        <motion.div
          className="w-24 h-24 border-2 rounded-md border-solid border-green-500 ml-10 "
          initial={{ opacity: 0, y: 400, x: 200 }}
          animate={box2Controls}
        >
          <img
            src="/assets/images/gdsc.svg"
            alt="Alt"
            className="bg-white rounded"
          />
        </motion.div>
      </div>
      <div>
        <motion.div
          className="w-64 h-28  mt-20 ml-10"
          // className="w-96"
          initial={{ opacity: 0, y: -400 }}
          animate={box3Controls}
        >
          <img
            src="/assets/images/gdsc.svg"
            alt="Alt"
            className="bg-white border-2 border-solid border-yellow-500 rounded w-64 h-28"
          />
        </motion.div>
      </div>
    </div>
  );
}

export default Images;
