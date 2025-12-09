import img1 from "../assets/images/tour-img01.jpg";
import img2 from "../assets/images/tour-img02.jpg";
import img3 from "../assets/images/tour-img03.jpg";
import img4 from "../assets/images/tour-img04.jpg";
import img5 from "../assets/images/tour-img05.jpg";
import img6 from "../assets/images/tour-img06.jpg";
import img7 from "../assets/images/tour-img07.jpg";
import img8 from "../assets/images/tour-img08.jpg";

const assetMap = {
  "/assets/images/tour-img01.jpg": img1,
  "/assets/images/tour-img02.jpg": img2,
  "/assets/images/tour-img03.jpg": img3,
  "/assets/images/tour-img04.jpg": img4,
  "/assets/images/tour-img05.jpg": img5,
  "/assets/images/tour-img06.jpg": img6,
  "/assets/images/tour-img07.jpg": img7,
  "/assets/images/tour-img08.jpg": img8,
};

const fallback = img1;

export const resolveSpotImage = (imgPath) => {
  if (!imgPath) return fallback;
  if (imgPath.startsWith("http")) return imgPath;
  return assetMap[imgPath] || fallback;
};

// For blogs: do NOT force a fallback. Return null when absent so UI can omit the image.
export const resolveBlogImage = (imgPath) => {
  if (!imgPath) return null;
  if (imgPath.startsWith("http")) return imgPath;
  return assetMap[imgPath] || imgPath;
};
