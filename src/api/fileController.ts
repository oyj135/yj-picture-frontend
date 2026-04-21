// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 此处后端没有提供注释 POST /file/search/picture */
export async function searchPictureByPicture(
  body: API.SearchPictureByPictureRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseListImageSearchResult>('/file/search/picture', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /file/test/download/ */
export async function testDownloadFile(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.testDownloadFileParams,
  options?: { [key: string]: any }
) {
  return request<any>('/file/test/download/', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /file/test/upload */
export async function uploadFile(body: {}, options?: { [key: string]: any }) {
  return request<API.BaseResponseString>('/file/test/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
