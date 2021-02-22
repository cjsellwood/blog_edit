import React from "react";

const EditForm = (props) => {
  return (
    <div className="NewForm">
      <h1 className="title">New Blog Post</h1>
      <form className="form" onSubmit={props.newPost}>
        <div>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            placeholder="Title"
            name="title"
            id="title"
            onChange={props.handlePostInput}
            value={props.postForm.title}
          />
        </div>
        <div>
          <label htmlFor="text">Content</label>
          <textarea
            placeholder="Content"
            name="text"
            id="text"
            rows="20"
            onChange={props.handlePostInput}
            value={props.postForm.text}
          ></textarea>
        </div>
        <div className="radio">
          <p>Publish Now?</p>
          <input
            type="radio"
            id="publish"
            name="publish"
            value="true"
            onChange={props.handlePostInput}
          />
          <label htmlFor="publish">Yes</label>
          <br></br>
          <input
            type="radio"
            id="unpublish"
            name="publish"
            value="false"
            onChange={props.handlePostInput}
          />
          <label htmlFor="unpublish">No</label>
        </div>
        <button>Submit</button>
      </form>{" "}
    </div>
  );
};

export default EditForm;
