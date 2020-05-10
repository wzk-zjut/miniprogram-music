// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const {OPENID}=cloud.getWXContext()
  const result=await cloud.openapi.subscribeMessage.send({
    touser:OPENID,
    page:`/pages/blog-comment/blog-comment?blogId=${event.blogId}`,
    data:{
      thing6:{
        value:"评价成功"
      },
      thing3:{
        value:event.content
      }
    },
    templateId:'sZjwAm-28tpTMgCuccTbTH5ONxlpcd_NEAXa-xqrO2I'
  })
  return result
}