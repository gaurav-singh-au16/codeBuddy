const User = require("../schema/user.schema");
const Post = require("../schema/post.schema");

module.exports.getUsersWithPostCount = async (req, res) => {
  try {
    //TODO: Implement this API
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const userPostPipeline = [
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'userId',
          as: 'userPosts',
        },
      },
      {
        $addFields: {
          posts: {
            $size: '$userPosts',
          },
        },
      },
      {
        $project: {
          name: 1,
          posts: 1,
        },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
    ];

    const usersWithPostCount = await User.aggregate(userPostPipeline);

    const totalDocs = await User.countDocuments();
    const totalPages = Math.ceil(totalDocs / limit);
    const pagingCounter = ((page - 1) * limit) + 1
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;
    const prevPage = hasPrevPage ? page - 1 : null;
    const nextPage = hasNextPage ? page + 1 : null;

    const result = {
      data: {
        users: usersWithPostCount,
        pagination: {
          totalDocs,
          limit,
          page,
          totalPages,
          pagingCounter,
          hasPrevPage,
          hasNextPage,
          prevPage,
          nextPage,
        },
      },
    };

    // console.log(result);
    res.status(200).json((result));

  } catch (error) {
    res.send({ error: error.message });
  }
};
