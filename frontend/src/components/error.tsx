import errorImage from "@/assets/images/404.jpg";

const Error = () => {
  return (
    <div className="flex items-center justify-center min-h-[90vh] bg-gray-100 text-gray-800 p-4">
      <div className="bg-white rounded-lg shadow-2xl overflow-hidden max-w-6xl w-full flex flex-col md:flex-row">
        {/* Left section for the image */}
        <div className="relative w-full md:w-1/2 p-6 flex items-center justify-center">
          <div className="h-full w-full flex items-center justify-center">
            {/* The image is a public URL, it's safer to use it this way */}
            <img
              src={errorImage}
              alt="A golden retriever dog digging a hole in the ground"
              className="rounded-lg max-h-96 md:max-h-full object-cover"
            />
          </div>
        </div>

        {/* Right section for the text */}
        <div className="w-full md:w-1/2 p-10 flex flex-col items-center justify-center text-center">
          <h1 className="text-8xl md:text-9xl font-extrabold text-blue-600 mb-4">
            404
          </h1>
          <p className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Oops! It seems you've dug up the wrong page.
          </p>
          <p className="text-gray-600 mb-8 max-w-sm">
            The page you're looking for doesn't exist or has been moved. The dog
            probably buried it somewhere.
          </p>
          <a
            href="/"
            className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition duration-300 transform hover:scale-105"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default Error;
