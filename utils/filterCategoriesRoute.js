const {Category,SubCategory,SubCategoryChild}  =  require('../models/category');



module.exports = async (customId) =>{
    if(customId>=20&&customId<=99){
        const  categoryRoute = await Category.findOne({'customId':customId}).populate('collectionName');
        const routeToCollection = categoryRoute.collectionName.slug;
        const routeToCategory = routeToCollection+'/'+categoryRoute.slug;
         return {
            type:'category',
            data:[
                {name:categoryRoute.collectionName.name,slug:routeToCollection},
                {name:categoryRoute.name,slug:routeToCategory}
            ]
        }
    }
    if(customId>=100&&customId<=499){
       const  subRoute = await SubCategory.findOne({'customId':customId}).populate({path:'category',select:'name slug',model:'Category',populate:{path:'collectionName',select:'name slug'}});
        const routeToCollection = subRoute.category.collectionName.slug;
        const routeToCategory = routeToCollection+'/'+subRoute.category.slug;
        const routeToSubCategory = routeToCategory+'/'+subRoute.slug
       return {
            type:'subCategory',
            data:[
                {name:subRoute.category.collectionName.name,slug:routeToCollection},
                {name:subRoute.category.name,slug:routeToCategory},
                {name:subRoute.name,slug:routeToSubCategory}
            ]
        }
    }
    if(customId>=500&&customId<=999){
       const subChilRoute = await SubCategoryChild.findOne({'customId':customId}).populate({path:"subCategory",model:'SubCategory',populate:{path:"category",model:'Category',populate:{path:'collectionName',select:'name slug'}}});
       const routeToCollection =subChilRoute.subCategory.category.collectionName.slug;
       const routeToCategory = routeToCollection+'/'+subChilRoute.subCategory.category.slug;
       const routeToSubCategory = routeToCategory+'/'+subChilRoute.subCategory.slug
       const routeToSubcategoryChild = routeToSubCategory+'/'+subChilRoute.slug
        return {
            type:'subCategoryChild',
            data:[
                {name:subChilRoute.subCategory.category.collectionName.name,slug:routeToCollection},
                {name:subChilRoute.subCategory.category.name,slug:routeToCategory},
                {name:subChilRoute.subCategory.name,slug:routeToSubCategory},
                {name:subChilRoute.name,slug:routeToSubcategoryChild}
            ]  
        }
    }
}