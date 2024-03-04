const cateModel = require('../Model/CateModel')

exports.createCategory = async (req, res) => {
    try {
        const { type,  } = req.body;

        const category = await cateModel.create({
            type,
            
        })
        console.log('category', category)
        await category.save();
        res.status(201).json({
            message: 'category created successfully successfully',
            data: category 
        })
    } catch(error) {
        res.status(500).json({
            message: error.message
        })
    }
};

exports.getCategory = async (req,res)=>{
    try {
        const allCate = await cateModel.find().populate('');
        
        res.status(200).json({
            message: 'This are all your Category',
            data:allCate
        });
    } catch (error) {
        res.status(500).json({
            message:error.message
        });
    }
};

exports.getOneCate = async (req, res) => {
    try {
        const id = req.params.id;
        const oneCate = await cateModel.findById(id).populate('house')
        if(!oneCate){
            return res.status(404).json({
                message: 'Category not found'
            })
        }
        res.status(200).json({
            message: "This is your Category",
            oneCate
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}


exports.deleteOneCate = async (req, res) => {
    try {
        const id = req.params.id;
        const category = await cateModel.findByIdAndDelete(id);
        if(!category){
            return res.status(404).json({
                message: 'Category does not exist'
            })
        }
        res.status(200).json({
            message: 'Category deleted'
        })
    }catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}