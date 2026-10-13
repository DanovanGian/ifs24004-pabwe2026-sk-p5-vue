import { ref } from "vue";
import { defineStore } from "pinia";
import * as aucationApi from "../api/aucationApi";

export const useAucationsStore = defineStore("aucations", () => {
  const aucations = ref([]);
  const aucation = ref(null);
  const isAucation = ref(false);

  const isAucationAdd = ref(false);
  const isAucationAdded = ref(false);
  const isAucationChange = ref(false);
  const isAucationChanged = ref(false);
  const isAucationChangeCover = ref(false);
  const isAucationChangedCover = ref(false);
  const isAucationDelete = ref(false);
  const isAucationDeleted = ref(false);
  const isBidAdd = ref(false);
  const isBidAdded = ref(false);
  const isBidDelete = ref(false);
  const isBidDeleted = ref(false);
  const isAucationDeleteAll = ref(false);
  const isAucationDeletedAll = ref(false);

  async function fetchAucations(params = {}) {
    isAucation.value = true;
    const response = await aucationApi.getAucations(params);
    if (response.success) {
      aucations.value = response.data.aucations;
    }
    isAucation.value = false;
    return response;
  }

  async function fetchAucation(id) {
    isAucation.value = true;
    const response = await aucationApi.getAucation(id);
    if (response.success) {
      aucation.value = response.data.aucation;
    }
    isAucation.value = false;
    return response;
  }

  // Pola yang sama dipakai semua aksi: nyalakan "proses", panggil API, nyalakan "selesai"
  async function runAction(api, processing, done) {
    processing.value = true;
    done.value = false;
    const response = await api();
    processing.value = false;
    done.value = response.success;
    return response;
  }

  const addAucation = (payload) =>
    runAction(() => aucationApi.postAucation(payload), isAucationAdd, isAucationAdded);

  const changeAucation = (id, payload) =>
    runAction(() => aucationApi.putAucation(id, payload), isAucationChange, isAucationChanged);

  const changeCover = (id, file) =>
    runAction(() => aucationApi.postCover(id, file), isAucationChangeCover, isAucationChangedCover);

  const removeAucation = (id) =>
    runAction(() => aucationApi.deleteAucation(id), isAucationDelete, isAucationDeleted);

  const addBid = (id, bid) =>
    runAction(() => aucationApi.postBid(id, bid), isBidAdd, isBidAdded);

  const removeBid = (id) =>
    runAction(() => aucationApi.deleteBid(id), isBidDelete, isBidDeleted);

  const removeAllAucations = () =>
    runAction(() => aucationApi.deleteAllAucations(), isAucationDeleteAll, isAucationDeletedAll);

  return {
    aucations, aucation, isAucation,
    isAucationAdd, isAucationAdded,
    isAucationChange, isAucationChanged,
    isAucationChangeCover, isAucationChangedCover,
    isAucationDelete, isAucationDeleted,
    isBidAdd, isBidAdded,
    isBidDelete, isBidDeleted,
    isAucationDeleteAll, isAucationDeletedAll,
    fetchAucations, fetchAucation,
    addAucation, changeAucation, changeCover,
    removeAucation, addBid, removeBid, removeAllAucations,
  };
});
