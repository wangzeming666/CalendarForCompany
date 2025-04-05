<script>
// イベント作成・編集用のモーダルダイアログ
export default {
  props: {
    // 外部から渡された事件对象（編集時）
    event: Object,
    // 外部から渡された初期日付（新規作成時）
    date: String,
    // モーダルの表示状態
    visible: Boolean,
  },
  emits: ['submit', 'delete', 'update:visible'],
  data() {
    return {
      // イベントフォームの初期データ構造
      form: {
        id: '',
        title: '',
        start: this.date || '',
        end: this.date || '',
        backgroundColor: '#42b983',
        people: [],
        device: [],
        details: '',
        repeat: 'none',
        customDates: [],
      },
      defaultColors: [
        '#42b983', '#f56c6c', '#409EFF', '#67C23A',
        '#E6A23C', '#A45EE5', '#20C997', '#FF8C00'
      ],
    }
  },
  watch: {
    visible(val) {
      if (val) {
        if (this.event) {
          // 编辑模式
          this.form = { ...this.event }
        } else {
          // 新建模式
          this.form = {
            id: '',
            title: '',
            start: this.date || '',
            end: this.date || '',
            backgroundColor: '#42b983',
            people: [],
            device: [],
            details: '',
            repeat: 'none',
            customDates: [],
          }
        }
      }
    }
  },
  methods: {
    // 「保存」ボタンの処理：親にフォームデータを送る
    handleSubmit() {
      this.$emit('submit', this.form)
    },
    // 「削除」ボタンの処理
    handleDelete() {
      this.$emit('delete', this.form.id)
    },
    // ダイアログを閉じる
    closeDialog() {
      this.$emit('update:visible', false)
    },
    // 選択済みの人物から削除する関数（未使用UIの場合）
    removePerson(name) {
      this.form.people = this.form.people.filter(p => p !== name)
    },
  },
}
</script>

<template>
  <!-- モーダル本体 -->
  <el-dialog
    :model-value="visible"
    @update:modelValue="$emit('update:visible', $event)"
    :title="form.id ? 'イベント編集' : '新規イベント作成'"
    width="600px"
    @close="closeDialog"
  >
    <!-- フォーム開始 -->
    <el-form :model="form" label-width="100px" label-position="top">
      <!-- タイトル -->
      <el-form-item label="タイトル">
        <el-input v-model="form.title" placeholder="イベント名を入力してください" />
      </el-form-item>

      <!-- 開始・終了日時 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="開始日時">
            <el-date-picker
              v-model="form.start"
              type="datetime"
              placeholder="開始日時"
              format="YYYY-MM-DD HH:mm"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="終了日時">
            <el-date-picker
              v-model="form.end"
              type="datetime"
              placeholder="終了日時"
              format="YYYY-MM-DD HH:mm"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 詳細説明 -->
      <el-form-item label="詳細">
        <el-input
          type="textarea"
          v-model="form.details"
          placeholder="イベントの詳細を入力してください"
          rows="2"
        />
      </el-form-item>

      <!-- 参加者選択 -->
      <el-form-item label="参加者">
        <el-select
          v-model="form.people"
          multiple
          placeholder="参加者を選択してください"
          style="width: 100%"
        >
          <el-option label="張三" value="張三" />
          <el-option label="李四" value="李四" />
          <el-option label="王五" value="王五" />
          <el-option label="趙六" value="趙六" />
        </el-select>
      </el-form-item>

      <!-- 利用設備選択 -->
      <el-form-item label="使用設備">
        <el-select
          v-model="form.device"
          multiple
          placeholder="設備を選択してください"
          style="width: 100%"
        >
          <el-option label="会議室 A" value="会議室 A" />
          <el-option label="会議室 B" value="会議室 B" />
          <el-option label="プロジェクター" value="プロジェクター" />
        </el-select>
      </el-form-item>

      <!-- 色選択 -->
      <el-form-item label="背景色">
        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
          <!-- プリセットカラー -->
          <div
            v-for="color in defaultColors"
            :key="color"
            :style="{
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              cursor: 'pointer',
              backgroundColor: color,
              border: form.backgroundColor === color ? '2px solid #000' : '1px solid #ccc'
            }"
            @click="form.backgroundColor = color"
            :title="color">
          </div>

          <!-- 手動選択パーツ -->
          <el-color-picker v-model="form.backgroundColor" show-alpha />
        </div>
      </el-form-item>


      <!-- 繰り返し設定 -->
      <el-form-item label="繰り返し">
        <el-select v-model="form.repeat" style="width: 100%">
          <el-option label="繰り返しなし" value="none" />
          <el-option label="毎日" value="daily" />
          <el-option label="毎週" value="weekly" />
          <el-option label="毎月" value="monthly" />
          <el-option label="不定期（手動選択）" value="custom" />
        </el-select>
      </el-form-item>

      <!-- 不定期日付選択 -->
      <el-form-item
        label="不定期日付"
        v-if="form.repeat === 'custom'"
      >
        <el-date-picker
          v-model="form.customDates"
          type="dates"
          format="YYYY-MM-DD"
          placeholder="複数日付を選択してください"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>

    <!-- フッター操作ボタン -->
    <template #footer>
      <el-button type="danger" @click="handleDelete" v-if="form.id">削除</el-button>
      <el-button @click="closeDialog">キャンセル</el-button>
      <el-button type="primary" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>
