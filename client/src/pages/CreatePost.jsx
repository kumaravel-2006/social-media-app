import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { Image, AlignLeft, ArrowLeft, Loader2 } from "lucide-react";

const CreatePost = () => {
  const [desc, setDesc] = useState("");
  const [img, setImg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!desc.trim() && !img.trim()) {
      setError("Please provide a description or an image URL.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await api.posts.create(desc, img);
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to create post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 max-sm:pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Create a Post</h1>
          <p className="text-xs text-gray-500 font-medium">Share your updates or designs with the community</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col gap-6">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Post Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-600 flex items-center gap-1.5 pl-1">
              <AlignLeft className="size-4 text-indigo-500" />
              What is on your mind?
            </label>
            <textarea
              required={!img}
              rows={5}
              placeholder="Share an update, design project, or ask a question..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-800 resize-none leading-relaxed"
            />
          </div>

          {/* Image URL Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-600 flex items-center gap-1.5 pl-1">
              <Image className="size-4 text-indigo-500" />
              Image URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={img}
              onChange={(e) => setImg(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-800"
            />
          </div>

          {/* Image Preview Block */}
          {img && (
            <div className="border border-gray-150 rounded-2xl overflow-hidden bg-gray-50 p-2 relative flex flex-col gap-2">
              <span className="text-[10px] font-semibold text-gray-400 pl-1 uppercase tracking-wider">Image Preview</span>
              <div className="rounded-xl overflow-hidden max-h-[300px] flex items-center justify-center bg-white border border-gray-100">
                <img
                  src={img}
                  alt="Attachment preview"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?q=80&w=600"; // fallback
                  }}
                  className="w-full h-full object-contain max-h-[300px]"
                />
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5 mt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-2xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-75 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-2xl font-semibold text-sm shadow-md shadow-indigo-100 flex items-center gap-2 cursor-pointer transition-all"
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              <span>Post Update</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
