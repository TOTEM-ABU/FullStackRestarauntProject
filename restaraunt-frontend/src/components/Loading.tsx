const Loading = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-warm-50 via-accent-50 to-primary-50">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
        </div>
        <p className="text-warm-600 font-medium">Yuklanmoqda...</p>
      </div>
    </div>
  );
};

export default Loading;
