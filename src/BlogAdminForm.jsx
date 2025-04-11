import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash } from "react-icons/fa";
import { BiArrowBack } from "react-icons/bi";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const BlogAdminForm = () => {
  const [blogs, setBlogs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showForm, setShowForm] = useState(false); 
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  

  useEffect(() => {
    return () => {
      const editors = document.querySelectorAll('.ck.ck-editor');
      editors.forEach(editor => editor.remove());
    };
  }, [showForm]);
  
  

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await axios.get('https://api.makemydocuments.com/api/blogs');
      setBlogs(res.data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      await axios.delete(`https://api.makemydocuments.com/api/blogs/${id}`);
      fetchBlogs();
    }
  };

  const handleEdit = (blog) => {
    setEditingId(blog._id);
    setTitle(blog.title);
    setDescription(blog.description);
    setMetaTitle(blog.metaTitle || '');
setMetaDescription(blog.metaDescription || '');

    setImage(null);
    setShowForm(true); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('metaTitle', metaTitle);
formData.append('metaDescription', metaDescription);

    if (image) formData.append('image', image);

    try {
      if (editingId) {
        await axios.put(`https://api.makemydocuments.com/api/blogs/${editingId}`, formData);
        setSuccessMessage('Blog updated successfully!');
      } else {
        await axios.post('https://api.makemydocuments.com/api/blogs', formData);
        setSuccessMessage('Blog created successfully!');
      }

      // Reset form
      setTitle('');
      setDescription('');
      setImage(null);
      setEditingId(null);
      fetchBlogs();

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving blog:', error);
      alert('Something went wrong!');
    }
  };

  return (
    <>
    <div className="container " style={{marginLeft:'100%', width:'380%', marginTop:'40%', fontFamily: "Poppins, sans-serif",}}>
       {/* <h2 className="text-center mb-4">Blog Management</h2> */}

{/* Success Alert */}
{successMessage && (
  <div className="alert alert-success text-center">{successMessage}</div>
)}

{/* Add Blog Button */}
{!showForm && (
  <div className="text-end mb-3">
    <button className="btn btn-success" onClick={() => setShowForm(true)}>
      + Add Blog
    </button>
  </div>
)}

{/* Blog Form */}
{showForm && (
  <form onSubmit={handleSubmit} className="card p-4 mb-5 shadow-sm">
    <div className="d-flex justify-content-between mb-3">
    <BiArrowBack
  size={22}
  style={{ cursor: "pointer", color: "#6c757d" }}
  onClick={() => {
    setShowForm(false);
    setEditingId(null);
    setTitle('');
    setDescription('');
    setImage(null);
  }}
  title="Close"
/>


      <h4>{editingId ? 'Edit Blog' : 'Create Blog'}</h4>
      
    </div>

    <div className="row mb-3">
      <div className="col-md-6">
        <label className="form-label">Title</label>
        <input
          type="text"
          className="form-control"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="col-md-6">
        <label className="form-label">Image</label>
        <input
          type="file"
          className="form-control"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />
      </div>
    </div>
    <div className="row mb-3">
  <div className="col-md-6">
    <label className="form-label">Meta Title</label>
    <input
      type="text"
      className="form-control"
      value={metaTitle}
      onChange={(e) => setMetaTitle(e.target.value)}
    />
  </div>
  <div className="col-md-6">
    <label className="form-label">Meta Description</label>
    <input
      type="text"
      className="form-control"
      value={metaDescription}
      onChange={(e) => setMetaDescription(e.target.value)}
      style={{width:"280%", height:'100%'}}
    />
  </div>
</div>


    <div className="mb-3">
      <label className="form-label">Description</label>
      <div
        style={{
          border: '1px solid #ced4da',
          borderRadius: '4px',
          minHeight: '300px',
        }}
      >
      <CKEditor
    key={editingId || 'new-blog-editor'}
    editor={ClassicEditor}
    data={description}
    onChange={(event, editor) => {
      const data = editor.getData();
      setDescription(data);
    }}
    onReady={(editor) => {
      editor.editing.view.change((writer) => {
        writer.setStyle(
          'min-height',
          '300px',
          editor.editing.view.document.getRoot()
        );
      });
    }}
  />

      </div>
    </div>

    <div className="text-center">
      <button className="btn btn-primary px-4" type="submit">
        {editingId ? 'Update Blog' : 'Create Blog'}
      </button>
    </div>
  </form>
)}

{/* Blog Table */}
{!showForm && (
  <div className="card shadow-sm p-3">
    <h4 className="mb-3">All Blogs</h4>
    <div className="table-responsive">
      <table className="table table-bordered align-middle">
        <thead className="table-light">
          <tr style={{textAlign:'center'}}>
            <th>Sl.No</th>
            <th>Title</th>
            <th>Image</th>
            <th>Description (Preview)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {blogs.map((blog, index) => (
            <tr key={blog._id}>
              <td>{index + 1}</td>
              <td>{blog.title}</td>
              <td>
                <img
                  src={`https://api.makemydocuments.com/uploads/blogs/${blog.image}`}
                  alt={blog.title}
                  style={{ height: '60px', borderRadius: '4px' }}
                />
              </td>
              <td>
                <div
                  style={{
                    maxHeight: '80px',
                    overflow: 'hidden',
                    fontSize: '14px',
                  }}
                  dangerouslySetInnerHTML={{
                    __html: blog.description.substring(0, 150) + '...',
                  }}
                />
              </td>
              <td className="text-nowrap">
  <FaEdit
    style={{ cursor: "pointer", marginRight: "15px", color: "#0d6efd" }}
    onClick={() => handleEdit(blog)}
    title="Edit"
  />
  <FaTrash
    style={{ cursor: "pointer", color: "#dc3545" }}
    onClick={() => handleDelete(blog._id)}
    title="Delete"
  />
</td>


            </tr>
          ))}
          {blogs.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center">
                No blogs available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
)}
    </div>
    </>
  );
};

export default BlogAdminForm;
